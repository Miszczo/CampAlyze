import type { APIRoute } from "astro";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../../../../lib/constants";
import Papa from "papaparse";

const MAX_ROWS_FOR_AI_ANALYSIS = 50; // Max rows to send to AI (excluding header)

export const POST: APIRoute = async ({ params, locals }) => {
  // Sprawdzenie, czy locals.supabase jest dostępne
  const supabase = locals.supabase;
  if (!supabase) {
    console.error("Supabase client is not available on Astro.locals in API route.");
    return new Response(
      JSON.stringify({ error: "Database client configuration error." }), // Można dodać dedykowany ERROR_MESSAGE
      {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Użyj locals.session bezpośrednio, zamiast locals.auth.validate()
  const session = locals.session;

  // Zaktualizowane sprawdzenie sesji
  if (!session || !session.user) {
    console.log("API Route: No active session or user found in locals.session.");
    return new Response(JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }), {
      status: HTTP_STATUS_CODES.UNAUTHORIZED,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log(`API Route: Session user ID: ${session.user.id}`);

  const importId = params.id;

  if (!importId) {
    return new Response(JSON.stringify({ error: ERROR_MESSAGES.MISSING_IMPORT_ID }), {
      status: HTTP_STATUS_CODES.BAD_REQUEST,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Attempting to read OpenRouter env variables...");
  console.log("Raw import.meta.env:", import.meta.env);
  const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
  const openRouterModel = import.meta.env.OPENROUTER_MODEL_NAME;

  console.log(
    `OPENROUTER_API_KEY from env: ${openRouterApiKey ? "Loaded (*******" + openRouterApiKey.slice(-4) + ")" : "NOT LOADED"}`
  );
  console.log(`OPENROUTER_MODEL_NAME from env: ${openRouterModel || "NOT LOADED"}`);

  if (!openRouterApiKey || !openRouterModel) {
    console.error("OpenRouter API key or model name is not configured properly in environment variables.");
    return new Response(
      JSON.stringify({
        error: ERROR_MESSAGES.OPENROUTER_CONFIG_MISSING,
      }),
      {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 1. Fetch import record to get file_path
    const { data: importRecord, error: importError } = await supabase
      .from("imports")
      .select("file_path, platform_id, id") // Removed file_name
      .eq("id", importId)
      .eq("user_id", session.user.id) // Używamy session.user.id z locals.session
      .single();

    if (importError || !importRecord) {
      console.error(
        "Error fetching import record:",
        importError,
        "For user_id:",
        session.user.id,
        "Import ID:",
        importId
      );
      return new Response(
        JSON.stringify({
          error: importError?.message || ERROR_MESSAGES.IMPORT_NOT_FOUND,
        }),
        {
          status: HTTP_STATUS_CODES.NOT_FOUND,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const filePath = importRecord.file_path;

    // 2. Download CSV from Supabase Storage
    const { data: blobData, error: downloadError } = await supabase.storage
      .from("imports") // Assuming your bucket is named 'imports'
      .download(filePath);

    if (downloadError || !blobData) {
      console.error("Error downloading file from Supabase Storage:", downloadError);
      return new Response(
        JSON.stringify({
          error: downloadError?.message || ERROR_MESSAGES.FILE_DOWNLOAD_FAILED,
        }),
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const csvText = await blobData.text();

    // 3. Parse CSV data
    const parsedCsv = Papa.parse(csvText, {
      header: true, // Assumes first row is header
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("Error parsing CSV:", parsedCsv.errors);
      return new Response(JSON.stringify({ error: ERROR_MESSAGES.CSV_PARSE_ERROR }), {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        headers: { "Content-Type": "application/json" },
      });
    }

    let dataForAI = parsedCsv.data;
    if (dataForAI.length > MAX_ROWS_FOR_AI_ANALYSIS) {
      // Take header (implicitly included by Papa.parse with header:true)
      // and a sample of rows
      dataForAI = dataForAI.slice(0, MAX_ROWS_FOR_AI_ANALYSIS);
    }

    // Convert array of objects back to CSV string for the prompt, or use JSON
    // For simplicity, sending a string representation might be easier for some models
    const csvSampleForAI = Papa.unparse(dataForAI);

    // 4. Prepare prompt for AI
    const prompt = `
      Analyze the following advertising campaign data from file '${importRecord.file_path}' (platform ID: ${importRecord.platform_id}).
      The data is a sample from a CSV file:
      --- CSV DATA SAMPLE ---
      ${csvSampleForAI}
      --- END CSV DATA SAMPLE ---

      Provide key insights, identify significant trends, and offer actionable optimization recommendations.
      Focus on metrics such as CPC (Cost Per Click), CTR (Click-Through Rate), CVR (Conversion Rate), CPA (Cost Per Acquisition), ROAS (Return on Ad Spend), and total spend and conversions, if available in the data.
      Present the analysis in a structured and easy-to-understand format. For example, use bullet points or short paragraphs for each key finding or recommendation.
      The analysis should be concise and directly useful for an advertiser looking to improve their campaign performance.
    `;

    // 5. Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error from OpenRouter API: ${response.status} ${response.statusText}`, errorBody);
      return new Response(
        JSON.stringify({
          error: `${ERROR_MESSAGES.OPENROUTER_API_ERROR} - ${response.statusText}`,
          details: errorBody,
        }),
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const openRouterResponse = await response.json();

    // 6. Process OpenRouter response
    const aiInsights = openRouterResponse.choices?.[0]?.message?.content?.trim();

    if (!aiInsights) {
      console.error("No insights found in OpenRouter response:", openRouterResponse);
      return new Response(
        JSON.stringify({
          error: ERROR_MESSAGES.OPENROUTER_NO_INSIGHTS,
        }),
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 7. (Optional) Save insights to DB
    const { error: saveError } = await supabase.from("ai_insights").insert({
      import_id: importId,
      insights: aiInsights,
      user_id: session.user.id,
      model_used: openRouterModel,
    } as any);

    if (saveError) {
      console.error("Error saving AI insights to DB:", saveError);
      // Decide if this should be a critical error or just a warning
      // For now, let's log it and proceed to return insights to the user
      // You might want to return an error to the user or handle it differently
    }

    // 8. Return AI insights
    return new Response(JSON.stringify({ insights: aiInsights }), {
      status: HTTP_STATUS_CODES.OK,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during AI analysis:", error);
    return new Response(JSON.stringify({ error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR }), {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      headers: { "Content-Type": "application/json" },
    });
  }
};

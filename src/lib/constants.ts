export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized. Please log in.",
  INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  MISSING_FILE: "No file was uploaded or file is invalid.",
  FILE_UPLOAD_FAILED: "Failed to upload file to storage.",
  DB_INSERT_FAILED: "Failed to save import details to the database.",
  SUPABASE_ERROR: "A Supabase error occurred.",
  MISSING_IMPORT_ID: "Import ID is missing.",
  IMPORT_NOT_FOUND: "Import record not found or access denied.",
  IMPORT_DELETION_FAILED: "Failed to delete import record.",
  FILE_DELETION_FAILED: "Failed to delete file from storage.",
  OPENROUTER_CONFIG_MISSING: "OpenRouter API key or model not configured.",
  FILE_DOWNLOAD_FAILED: "Failed to download file for analysis.",
  CSV_PARSE_ERROR: "Failed to parse CSV file.",
  OPENROUTER_API_ERROR: "Error communicating with OpenRouter API.",
  OPENROUTER_NO_INSIGHTS: "No insights received from OpenRouter API.",
  // Add other generic error messages here
};

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  // Add other status codes as needed
};

export const SUCCESS_MESSAGES = {
  // ... existing code ...
};

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CampaignChartProps {
  data: {
    date: string;
    clicks?: number | null;
    impressions?: number | null;
    spend?: number | null;
    conversions?: number | null;
    ctr?: number | null;
    cpc?: number | null;
    roas?: number | null;
  }[];
  metric: string; // Klucz metryki do wyświetlenia, np. 'clicks', 'impressions'
  metricLabel: string; // Etykieta dla metryki, np. 'Kliknięcia', 'Wyświetlenia'
  color?: string;
}

const CampaignChart: React.FC<CampaignChartProps> = ({ data, metric, metricLabel, color = "#8884d8" }) => {
  if (!data || data.length === 0) {
    return <p>Brak danych do wyświetlenia na wykresie.</p>;
  }

  // Sprawdzenie, czy wybrana metryka istnieje w danych
  const sampleDataPoint = data[0];
  if (sampleDataPoint && typeof (sampleDataPoint as Record<string, any>)[metric] === "undefined") {
    console.warn(
      'Metryka "' +
        metric +
        '" nie została znaleziona w danych. Dostępne metryki: ' +
        Object.keys(sampleDataPoint).join(", ")
    );
    return <p>Wybrana metryka &quot;{metricLabel}&quot; nie jest dostępna w danych.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={metric} name={metricLabel} stroke={color} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CampaignChart;

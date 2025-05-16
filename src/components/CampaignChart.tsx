import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Definicja typu dla pojedynczego punktu danych
interface DataPoint {
  date: string;
  clicks?: number | null;
  impressions?: number | null;
  spend?: number | null;
  conversions?: number | null;
  ctr?: number | null;
  cpc?: number | null;
  roas?: number | null;
  // Można dodać więcej opcjonalnych metryk w przyszłości
}

// Typ dla kluczy metryk, które mogą być wyświetlane na wykresie
// Obejmuje wszystkie klucze z DataPoint oprócz 'date'
type DisplayableMetricKey = Exclude<keyof DataPoint, "date">;

interface CampaignChartProps {
  data: DataPoint[];
  metric: DisplayableMetricKey; // Użycie zawężonego typu dla `metric`
  metricLabel: string;
  color?: string;
}

const CampaignChart: React.FC<CampaignChartProps> = ({ data, metric, metricLabel, color = "#8884d8" }) => {
  if (!data || data.length === 0) {
    return <p>Brak danych do wyświetlenia na wykresie.</p>;
  }

  // Sprawdzenie, czy wybrana metryka istnieje w pierwszym punkcie danych
  // TypeScript powinien teraz poprawnie zawęzić typ `metric` do kluczy DataPoint
  const sampleDataPoint = data[0];
  // Sprawdzamy, czy klucz `metric` istnieje w obiekcie i czy jego wartość nie jest undefined.
  // Wcześniej typeof ... === 'undefined' mogło być problematyczne dla kluczy z wartością null.
  if (!(metric in sampleDataPoint) || sampleDataPoint[metric] === undefined) {
    console.warn(
      `Metryka "${metric}" (etykieta: "${metricLabel}") nie została znaleziona w pierwszym punkcie danych lub jej wartość to undefined. Dostępne klucze w pierwszym punkcie: ${Object.keys(sampleDataPoint).join(", ")}`
    );
    return (
      <p>Wybrana metryka &quot;{metricLabel}&quot; nie jest dostępna w danych lub jej wartość jest nieokreślona.</p>
    );
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

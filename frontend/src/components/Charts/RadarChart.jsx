import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function HouseRadarChart({ data }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">
        So sánh tiêu chí căn nhà
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="criteria" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Legend />

          <Radar
            name="Nhà của bạn"
            dataKey="user"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.5}
          />

          <Radar
            name="Trung bình khu vực"
            dataKey="average"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
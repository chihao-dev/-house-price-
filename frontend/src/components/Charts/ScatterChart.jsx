import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function MarketScatterChart({ marketData, userHouse }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">
        So sánh giá nhà với thị trường
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />

          <XAxis
            dataKey="area"
            name="Diện tích"
            unit=" m²"
          />
          <YAxis
            dataKey="price"
            name="Giá"
            unit=" tỷ"
          />

          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />

          {/* Dữ liệu thị trường */}
          <Scatter
            name="Thị trường"
            data={marketData}
            fill="#8884d8"
          />

          {/* Nhà của người dùng */}
          <Scatter
            name="Nhà của bạn"
            data={[userHouse]}
            fill="#ef4444"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
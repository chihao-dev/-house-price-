// RadarChart.jsx
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// ⚡ Đăng ký tất cả element cần thiết cho Bar + Line chart
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export default function AvgPriceChart({ avgPrices, predictedPrice, district }) {
  const labels = Object.keys(avgPrices);
  const data = Object.values(avgPrices);

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg">
      <h3 className="text-white font-semibold mb-4">
        Giá nhà trung bình theo phường – {district}
      </h3>
      <Bar
        key={labels.join('-') + predictedPrice} // ⚡ key để React destroy & recreate chart khi data thay đổi
        data={{
          labels,
          datasets: [
            {
              label: 'Giá trung bình (tỷ VND)',
              data,
              backgroundColor: 'skyblue',
            },
            {
              label: 'Giá căn demo',
              type: 'line',
              data: Array(labels.length).fill(predictedPrice / 1e9),
              borderColor: 'red',
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: 'white' } },
          },
          scales: {
            x: { ticks: { color: 'white' } },
            y: { ticks: { color: 'white' } },
          },
        }}
      />
    </div>
  );
}
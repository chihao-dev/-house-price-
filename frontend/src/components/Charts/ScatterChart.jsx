// SimilarPricePie.jsx
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// ⚡ Chỉ cần ArcElement vì chỉ vẽ Pie / Doughnut
ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function SimilarPricePie({ locationSuggest }) {
  const labels = Object.keys(locationSuggest);
  const counts = Object.values(locationSuggest);
  const total = counts.reduce((a, b) => a + b, 0);

  // Tỉ lệ %
  const percentages = counts.map(v => ((v / total) * 100).toFixed(1));

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mt-6">
      <h3 className="text-white font-semibold mb-4">
        Khu vực có mức giá tương đương căn demo
      </h3>
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data: percentages,
              backgroundColor: [
                '#4ade80', '#22d3ee', '#facc15', '#f472b6',
                '#60a5fa', '#f87171', '#a78bfa', '#fbbf24'
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: 'white' } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const idx = context.dataIndex;
                  return `${labels[idx]}: ${counts[idx]} nhà (${percentages[idx]}%)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
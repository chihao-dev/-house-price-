import { motion } from "framer-motion";

function formatVND(number) {
  if (!number) return "0";
  return Number(number).toLocaleString("vi-VN");
}

function formatTyTrieu(price) {
  price = Number(price) || 0;
  const ty = Math.floor(price / 1_000_000_000);
  const trieu = Math.floor((price % 1_000_000_000) / 1_000_000);
  if (ty > 0) return `${ty} tỷ ${trieu} triệu`;
  return `${trieu} triệu`;
}

export default function PriceResult({
  price,
  area,
  bedrooms,
  toilets,
  floors,
  location,
  houseType,
  mainDirection,
  balconyDirection,
  legal
}) {
  price = Number(price);
  if (!price || price <= 0) {
    return (
      <div className="text-white/80 text-center text-lg">
        Nhập thông tin và bấm <b>Dự đoán giá</b>
      </div>
    );
  }

  const pricePerM2 = area ? Math.round(price / area) : 0;

  return (
    <div className="text-white">
      <h2 className="text-lg font-semibold opacity-90">
        Giá nhà dự đoán bởi AI
      </h2>

      <motion.div
        key={price}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-5xl font-bold mt-4"
      >
        {(price / 1_000_000_000).toFixed(2)} 
        <span className="text-2xl"> tỷ VND</span>

        <p className="text-lg text-yellow-300 mt-2">
          ≈ {formatTyTrieu(price)}
        </p>

        <p className="text-sm opacity-70">
          {formatVND(price)} VND
        </p>
      </motion.div>

      <div className="mt-4 text-lg">
        <p>
          Giá / m²: 
          <span className="font-semibold text-yellow-300 ml-2">
            {formatVND(pricePerM2)} đ
          </span>
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm opacity-90">
        <div>Khu vực: {location}</div>
        <div>Loại nhà: {houseType}</div>
        <div>Diện tích: {area} m²</div>
        <div>Phòng ngủ: {bedrooms}</div>
        <div>WC: {toilets}</div>
        <div>Tổng tầng: {floors}</div>
        <div>Hướng cửa: {mainDirection}</div>
        <div>Pháp lý: {legal}</div>
      </div>
    </div>
  );
}
import { motion } from "framer-motion";

function formatVND(number) {
  return number.toLocaleString("vi-VN");
}

function formatTyTrieu(price) {

  const ty = Math.floor(price / 1_000_000_000);
  const trieu = Math.floor((price % 1_000_000_000) / 1_000_000);

  if (ty > 0) {
    return `${ty} tỷ ${trieu} triệu`;
  }

  return `${trieu} triệu`;
}

export default function PriceResult({
  price,
  pricePerM2,
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
  console.log("Main direction:", mainDirection);
  console.log("Balcony direction:", balconyDirection);
  if (price === null || price === undefined) {
    return (
      <div className="text-white/80 text-center text-lg">
        Nhập thông tin và bấm <b>Dự đoán giá</b>
      </div>
    );
  }

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
        <span className="text-2xl">tỷ VND</span>

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
            {formatVND(Math.round(price / area))} đ
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

        <div>Hướng ban công: {balconyDirection}</div>

        <div>Pháp lý: {legal}</div>

      </div>

    </div>
  );
}
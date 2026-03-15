import { useEffect, useState } from "react";
import SliderInput from "../components/SliderInput";
import SelectionCard from "../components/SelectionCard";
import PriceResult from "../components/PriceResult";

export default function Dashboard() {

  const [area, setArea] = useState(80);
  const [floors, setFloors] = useState(2);
  const [bedrooms, setBedrooms] = useState(3);
  const [toilets, setToilets] = useState(2);
  const [pricePerM2, setPricePerM2] = useState(50000000);

  const [location, setLocation] = useState("");
  const [houseType, setHouseType] = useState("");
  const [doorDirection, setDoorDirection] = useState("");
  const [balconyDirection, setBalconyDirection] = useState("");
  const [legalDocs, setLegalDocs] = useState("");

  const [categories, setCategories] = useState({});
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [areaMin, setAreaMin] = useState(10);
  const [areaMax, setAreaMax] = useState(500);

  const [bedMax, setBedMax] = useState(10);
  const [wcMax, setWcMax] = useState(10);
  const [floorMax, setFloorMax] = useState(10);

  // ================= LOAD CATEGORIES =================
  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Load categories error:", err));
  }, []);

  useEffect(() => {

    if (!houseType) return;

    const range = AREA_RANGE[houseType.toLowerCase()];

    if (range) {
      setAreaMin(range.min);
      setAreaMax(range.max);
      setArea(range.min);
    }

    setBedrooms(0);
    setToilets(0);
    setFloors(0);

    if (LAND_TYPES.includes(houseType.toLowerCase())) {
      setDoorDirection("");
      setBalconyDirection("");
    }

  }, [houseType]);

  useEffect(() => {
    if (!area || !houseType) return;

    const limits = getLimits(area, houseType);

    setBedMax(limits.bed);
    setWcMax(limits.wc);
    setFloorMax(limits.floor);

    if (bedrooms > limits.bed) setBedrooms(limits.bed);
    if (toilets > limits.wc) setToilets(limits.wc);
    if (floors > limits.floor) setFloors(limits.floor);

  }, [area, houseType]);

  // ================= PREDICT =================
  const handlePredict = async () => {

    const payload = {
      location: location,          // 🔥 THÊM DÒNG NÀY
      District: location,          // giữ lại cho backend normalize
      "Type of House": houseType,
      "Land Area": area,
      Bedrooms: bedrooms,
      WC: toilets,
      Floors: floors,
      "House Direction": doorDirection,
      "Balcony Direction": balconyDirection,
      "Legal Status": legalDocs
    };

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.predicted_price) {
        setPredictedPrice(data.predicted_price);
      } else {
        alert("Predict lỗi!");
      }

    } catch (err) {
      console.error("Predict error:", err);
      alert("Có lỗi khi dự đoán giá!");
    } finally {
      setLoading(false);
    }
  };

  const LEGAL_RULES = {

    "biệt thự": [
      "Sổ hồng / Sổ đỏ",
      "Đang chờ sổ"
    ],

    "chung cư": [
      "Sổ hồng / Sổ đỏ",
      "Hợp đồng mua bán",
      "Đang chờ sổ"
    ],

    "đất thổ cư": [
      "Sổ hồng / Sổ đỏ",
      "Đang chờ sổ",
      "Sổ chung",
      "Giấy tay / Vi bằng"
    ],

    "nhà hẻm": [
      "Sổ hồng / Sổ đỏ",
      "Đang chờ sổ",
      "Sổ chung",
      "Giấy tay / Vi bằng"
    ],

    "nhà mặt tiền": [
      "Sổ hồng / Sổ đỏ",
      "Đang chờ sổ"
    ],

  };

  const DIRECTION_ORDER = [
    "Đông",
    "Tây",
    "Nam",
    "Bắc"
  ];

  // range diện tích theo loại nhà
  const AREA_RANGE = {
    "chung cư": { min: 40, max: 300 },
    "nhà hẻm": { min: 40, max: 300 },
    "nhà mặt tiền": { min: 60, max: 600 },
    "đất thổ cư": { min: 60, max: 1000 },
    "biệt thự": { min: 100, max: 1000 }
  };

  const LAND_TYPES = [
    "đất thổ cư"
  ];

  const isFormValid = () => {

    if (!location) return false;
    if (!houseType) return false;
    if (!legalDocs) return false;

    // ✅ mọi loại nhà, kể cả đất, đều phải có hướng cửa
    if (!doorDirection) return false;

    // ❌ bỏ hoàn toàn hướng ban công
    return true;
  };

  // rule giống python
  function getLimits(area, houseType) {

    if (!houseType) {
      return { bed: 0, wc: 0, floor: 0 };
    }

    houseType = houseType.toLowerCase();

    // =====================
    // ĐẤT THỔ CƯ – KHÔNG PHÒNG
    // =====================
    if (houseType === "đất thổ cư") {
      return { bed: 0, wc: 0, floor: 0 };
    }

    // =====================
    // CHUNG CƯ (40 – 300) – KHÔNG LẦU
    // =====================
    if (houseType === "chung cư") {
      if (area <= 80) {
        return { bed: 1, wc: 1, floor: 0 };
      }
      if (area <= 120) {
        return { bed: 2, wc: 2, floor: 0 };
      }
      if (area <= 180) {
        return { bed: 3, wc: 2, floor: 0 };
      }
      if (area <= 240) {
        return { bed: 4, wc: 3, floor: 0 };
      }
      // 240 – 300
      return { bed: 5, wc: 4, floor: 0 };
    }

    // =====================
    // NHÀ HẺM (40 – 300)
    // =====================
    if (houseType === "nhà hẻm") {
      if (area <= 80) {
        return { bed: 3, wc: 1, floor: 1 };
      }
      if (area <= 120) {
        return { bed: 3, wc: 2, floor: 1 };
      }
      if (area <= 180) {
        return { bed: 4, wc: 3, floor: 2 };
      }
      if (area <= 240) {
        return { bed: 5, wc: 4, floor: 2 };
      }
      // 240 – 300
      return { bed: 6, wc: 5, floor: 3 };
    }

    // =====================
    // NHÀ MẶT TIỀN (60 – 600)
    // =====================
    if (houseType === "nhà mặt tiền") {
      if (area <= 100) {
        return { bed: 3, wc: 2, floor: 1 };
      }
      if (area <= 200) {
        return { bed: 4, wc: 3, floor: 2 };
      }
      if (area <= 300) {
        return { bed: 6, wc: 4, floor: 3 };
      }
      if (area <= 450) {
        return { bed: 8, wc: 5, floor: 4 };
      }
      // 450 – 600
      return { bed: 10, wc: 6, floor: 4 };
    }

    // =====================
    // BIỆT THỰ (100 – 1000)
    // =====================
    if (houseType === "biệt thự") {
      if (area <= 300) {
        return { bed: 4, wc: 3, floor: 2 };
      }
      if (area <= 500) {
        return { bed: 6, wc: 5, floor: 2 };
      }
      if (area <= 800) {
        return { bed: 8, wc: 6, floor: 3 };
      }
      // 800 – 1000
      return { bed: 12, wc: 8, floor: 3 };
    }

    // fallback an toàn
    return { bed: 0, wc: 0, floor: 0 };
  }

  const isLand = LAND_TYPES.includes(houseType.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Ứng dụng dự đoán giá nhà đất
        </h1>

        <p className="text-gray-400 mt-1">
          Machine Learning Real Estate Prediction
        </p>
      </div>


      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* LEFT PANEL */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-6">

          <h2 className="text-lg font-semibold">
            Thông tin căn nhà
          </h2>


          {/* LOCATION AUTOCOMPLETE */}
          <div className="relative">
            <label className="text-sm text-gray-300">
              Khu vực
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Nhập xã / phường / quận..."
              className="mt-1 w-full bg-black/30 border border-white/20 rounded-lg p-2"
            />

            {showDropdown && location && (
              <div className="absolute z-10 w-full bg-gray-900 border border-white/20 rounded-lg mt-1 max-h-48 overflow-y-auto">

                {categories["location"]
                  ?.filter(item =>
                    item.toLowerCase().includes(location.toLowerCase())
                  )
                  .slice(0, 8)
                  .map(item => (

                    <div
                      key={item}
                      onClick={() => {
                        setLocation(item);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-indigo-600 cursor-pointer"
                    >
                      {item}
                    </div>

                ))}

              </div>
            )}
          </div>

          {/* HOUSE TYPE */}
          <div>
            <p className="text-sm text-gray-300 mb-2">
              Loại nhà
            </p>

            <div className="grid grid-cols-2 gap-3">

              {categories["Type of House"]?.map(type => (

                <SelectionCard
                  key={type}
                  label={type}
                  selected={houseType === type}
                  onClick={() => {
                    setHouseType(type)
                    setLegalDocs("")   // reset pháp lý
                  }}
                />
              ))}

            </div>
          </div>

          {/* LEGAL */}
          {houseType && (

          <div>
            <p className="text-sm text-gray-300 mb-2">
              Pháp lý
            </p>

            <div className="grid grid-cols-2 gap-3">

            {LEGAL_RULES[houseType.toLowerCase()]?.map(item => (

              <SelectionCard
                key={item}
                label={item}
                selected={legalDocs === item}
                onClick={() => setLegalDocs(item)}
              />

            ))}

            </div>

          </div>

          )}

          {/* AREA */}
          <SliderInput
            label="Diện tích đất"
            value={area}
            setValue={setArea}
            min={areaMin}
            max={areaMax}
            unit="m²"
          />

          {/* FLOORS */}
          <SliderInput
            label="Số tầng"
            value={floors}
            setValue={setFloors}
            min={0}
            max={isLand ? 0 : floorMax}
          />

          {/* BEDROOMS */}
          <SliderInput
            label="Phòng ngủ"
            value={bedrooms}
            setValue={setBedrooms}
            min={0}
            max={isLand ? 0 : bedMax}
          />

          {/* TOILETS */}
          <SliderInput
            label="Nhà vệ sinh"
            value={toilets}
            setValue={setToilets}
            min={0}
            max={isLand ? 0 : wcMax}
          />

          {/* HOUSE DIRECTION */}
          <div>
            <p className="text-sm text-gray-300 mb-2">
              Hướng cửa chính
            </p>

            <div className="grid grid-cols-4 gap-2">
              {categories["House Direction"]
                ?.sort(
                  (a, b) =>
                    DIRECTION_ORDER.indexOf(a) -
                    DIRECTION_ORDER.indexOf(b)
                )
                .map(dir => (
                  <SelectionCard
                    key={dir}
                    label={dir || "Không rõ"}
                    selected={doorDirection === dir}
                    onClick={() => setDoorDirection(dir)}
                  />
                ))}
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handlePredict}
            disabled={loading || !isFormValid()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-3 font-semibold"
          >

            {loading ? "Đang dự đoán..." : "Dự đoán giá"}

          </button>

        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 shadow-2xl">

          <PriceResult
            price={predictedPrice}
            pricePerM2={pricePerM2}
            area={area}
            bedrooms={bedrooms}
            toilets={toilets}
            floors={floors}
            location={location}
            houseType={houseType}
            mainDirection={doorDirection}
            balconyDirection={balconyDirection}
            legal={legalDocs}
          />

          <div className="mt-6 bg-white/10 border border-white/20 rounded-xl h-52 flex items-center justify-center">

            Biểu đồ phân tích giá nhà (Chart.js - nâng cấp)

          </div>

        </div>

      </div>


      {/* FOOTER */}
      <footer className="text-center text-gray-500 mt-10 text-sm">
        © 2025 House Price Prediction AI
      </footer>

    </div>
  );
}
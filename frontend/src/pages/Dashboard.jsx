import { useEffect, useState } from "react";
import SliderInput from "../components/SliderInput";
import SelectionCard from "../components/SelectionCard";
import PriceResult from "../components/PriceResult";
import AvgPriceChart from "../components/Charts/RadarChart";        // biểu đồ giá trung bình theo phường
import SimilarPricePie from "../components/Charts/ScatterChart";

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

  const DIRECTION_ORDER = ["Đông", "Tây", "Nam", "Bắc"];
  const LAND_TYPES = ["đất thổ cư"];

  // AREA_RANGE & LEGAL_RULES
  const AREA_RANGE = {
    "Biệt thự / Villa": { min: 100, max: 800 },
    "Căn hộ dịch vụ / Mini": { min: 30, max: 120 },
    "Nhà hẻm / Ngõ": { min: 40, max: 250 },
    "Nhà mặt tiền": { min: 60, max: 500 },
    "Đất dự án / Khu dân cư": { min: 60, max: 1000 },
    "Đất nông nghiệp / Kho bãi": { min: 100, max: 5000 },
    "Đất thổ cư": { min: 60, max: 1000 }
  };

  const LEGAL_RULES = {
    "Biệt thự / Villa": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Hợp đồng mua bán", "Sổ đỏ", "Sổ hồng"],
    "Căn hộ dịch vụ / Mini": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Hợp đồng mua bán", "Sổ đỏ", "Sổ hồng"],
    "Nhà hẻm / Ngõ": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Hợp đồng mua bán", "Sổ đỏ", "Sổ hồng"],
    "Nhà mặt tiền": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Hợp đồng mua bán", "Sổ đỏ", "Sổ hồng"],
    "Đất dự án / Khu dân cư": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Hợp đồng mua bán", "Sổ đỏ", "Sổ hồng"],
    "Đất nông nghiệp / Kho bãi": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác"],
    "Đất thổ cư": ["Đang chờ sổ", "Giấy tờ hợp lệ", "Giấy tờ khác", "Sổ đỏ", "Sổ hồng"]
  };

  const [avgPrices, setAvgPrices] = useState({});       // { 'Phường 1': 5.3, ... }
  const [districtName, setDistrictName] = useState(""); // quận / huyện đang phân tích
  const [locationSuggest, setLocationSuggest] = useState({}); // { 'Phường 1': 12, ... }

  // Helper map để lấy key chính xác
  const getHouseKey = (type) => {
    if (!type) return null;
    return Object.keys(AREA_RANGE).find(
      k => k.toLowerCase().replace(/\s|\/|,/g,'') === type.toLowerCase().replace(/\s|\/|,/g,'')
    ) || null;
  };

  // Lấy dữ liệu categories từ backend
  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Load categories error:", err));
  }, []);

  useEffect(() => {
    if (predictedPrice && location) {
      // Giả lập avgPrices
      const demoAvg = {
        "Phường 1": predictedPrice * 0.9,
        "Phường 2": predictedPrice * 1.1,
        "Phường 3": predictedPrice * 1.0
      };
      setAvgPrices(demoAvg);
      setDistrictName(location);

      // Giả lập locationSuggest
      const demoSuggest = {
        "Phường 4": 10,
        "Phường 5": 7,
        "Phường 6": 12
      };
      setLocationSuggest(demoSuggest);
    }
  }, [predictedPrice, location]);

  // Update slider min/max khi chọn houseType
  useEffect(() => {
    if (!houseType) return;
    const key = getHouseKey(houseType);
    if (!key) return;
    const range = AREA_RANGE[key];
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

const [chartData, setChartData] = useState({ avgPrices: {}, locationSuggest: {} });

const handlePredict = async () => {
  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        District: location,
        "Type of House": houseType,
        "Land Area": area,
        Bedrooms: bedrooms,
        WC: toilets,
        Floors: floors,
        "House Direction": doorDirection,
        "Balcony Direction": balconyDirection,
        "Legal Status": legalDocs
      })
    });
    const data = await res.json();

    if (data.predictedPrice != null) {
      setPredictedPrice(data.predictedPrice);
      setDistrictName(data.predictedLocation || location);

      // ⚡ set dữ liệu chart ngay lập tức
      setChartData({
        avgPrices: data.avgPrices || {},
        locationSuggest: data.locationSuggest || {}
      });
    } else {
      alert("Predict lỗi!");
    }
  } catch (err) {
    console.error(err);
    alert("Có lỗi khi dự đoán giá!");
  } finally {
    setLoading(false);
  }
};

  const isFormValid = () => location && houseType && legalDocs && doorDirection;
  const isLand = LAND_TYPES.includes(houseType.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ứng dụng dự đoán giá nhà đất</h1>
        <p className="text-gray-400 mt-1">Machine Learning Real Estate Prediction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Thông tin căn nhà</h2>

          {/* LOCATION */}
          <div className="relative">
            <label className="text-sm text-gray-300">Khu vực</label>
            <input
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Nhập xã / phường / quận..."
              className="mt-1 w-full bg-black/30 border border-white/20 rounded-lg p-2"
            />
            {showDropdown && location && (
              <div className="absolute z-10 w-full bg-gray-900 border border-white/20 rounded-lg mt-1 max-h-48 overflow-y-auto">
                {categories["location"]?.filter(item => item.toLowerCase().includes(location.toLowerCase())).slice(0, 8)
                  .map(item => <div key={item} onClick={() => { setLocation(item); setShowDropdown(false); }}
                    className="px-3 py-2 hover:bg-indigo-600 cursor-pointer">{item}</div>)}
              </div>
            )}
          </div>

          {/* HOUSE TYPE */}
          <div>
            <p className="text-sm text-gray-300 mb-2">Loại nhà</p>
            <div className="grid grid-cols-2 gap-3">
              {categories["type of house"]?.map(type => (
                <SelectionCard key={type} label={type} selected={houseType === type}
                  onClick={() => { setHouseType(type); setLegalDocs(""); setDoorDirection(""); setBalconyDirection(""); }} />
              ))}
            </div>
          </div>

          {/* LEGAL */}
          {houseType && (
            <div>
              <p className="text-sm text-gray-300 mb-2">Pháp lý</p>
              <div className="grid grid-cols-2 gap-3">
                {LEGAL_RULES[getHouseKey(houseType)]?.map(item => (
                  <SelectionCard key={item} label={item} selected={legalDocs === item} onClick={() => setLegalDocs(item)} />
                ))}
              </div>
            </div>
          )}

          {/* AREA */}
          <SliderInput label="Diện tích đất" value={area} setValue={setArea} min={areaMin} max={areaMax} unit="m²" />

          {/* BED / WC / FLOOR */}
          <div>
            <label className="text-sm text-gray-300 mt-2">Số tầng</label>
            <input type="number" value={floors} onChange={(e) => setFloors(Number(e.target.value))}
              className="mt-1 w-full bg-black/30 border border-white/20 rounded-lg p-2" min={0} max={100} />
          </div>
          <div>
            <label className="text-sm text-gray-300 mt-2">Phòng ngủ</label>
            <input type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))}
              className="mt-1 w-full bg-black/30 border border-white/20 rounded-lg p-2" min={0} max={100} />
          </div>
          <div>
            <label className="text-sm text-gray-300 mt-2">Nhà vệ sinh</label>
            <input type="number" value={toilets} onChange={(e) => setToilets(Number(e.target.value))}
              className="mt-1 w-full bg-black/30 border border-white/20 rounded-lg p-2" min={0} max={100} />
          </div>

          {/* HOUSE DIRECTION */}
          <div>
            <p className="text-sm text-gray-300 mb-2 mt-2">Hướng cửa chính</p>
            <div className="grid grid-cols-4 gap-2">
              {categories["main door direction"]?.sort((a,b)=>DIRECTION_ORDER.indexOf(a)-DIRECTION_ORDER.indexOf(b))
                .map(dir => (
                  <SelectionCard key={dir} label={dir || "Không rõ"} selected={doorDirection===dir} onClick={()=>setDoorDirection(dir)} />
                ))}
            </div>
          </div>

          {/* BALCONY DIRECTION */}
          <div>
            <p className="text-sm text-gray-300 mb-2 mt-2">Hướng ban công</p>
            <div className="grid grid-cols-4 gap-2">
              {categories["balcony direction"]?.sort((a,b)=>DIRECTION_ORDER.indexOf(a)-DIRECTION_ORDER.indexOf(b))
                .map(dir => (
                  <SelectionCard key={dir} label={dir || "Không rõ"} selected={balconyDirection===dir} onClick={()=>setBalconyDirection(dir)} />
                ))}
            </div>
          </div>

          {/* BUTTON */}
          <button onClick={handlePredict} disabled={loading || !isFormValid()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-3 font-semibold">
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
            {predictedPrice && (
              <>
                <AvgPriceChart
                  avgPrices={chartData.avgPrices}
                  predictedPrice={predictedPrice * 1e9}
                  district={districtName}
                />

                <SimilarPricePie
                  locationSuggest={chartData.locationSuggest}
                />
              </>
            )}
        </div>
      </div>

      <footer className="text-center text-gray-500 mt-10 text-sm">
        © 2025 House Price Prediction AI
      </footer>
    </div>
  );
}
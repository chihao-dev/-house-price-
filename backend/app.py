# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)  # cho phép frontend gọi từ localhost:3000

# -------------------------------
# Load model, feature columns, categories
# -------------------------------
with open('rf_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('feature_columns.pkl', 'rb') as f:
    feature_columns = pickle.load(f)

with open('categories.pkl', 'rb') as f:
    categories = pickle.load(f)

# Load dataset gốc để tính avgPrices
# Giả sử bạn đã có X_train, y_train pickle
with open('X_train.pkl', 'rb') as f:
    X_train = pickle.load(f)

with open('y_train.pkl', 'rb') as f:
    y_train = pickle.load(f)

# -------------------------------
# API trả về categories
# -------------------------------
@app.route('/categories', methods=['GET'])
def get_categories():
    return jsonify(categories)

# -------------------------------
# API predict
# -------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # ---------------------------
    # 1. Tạo DataFrame demo
    # ---------------------------
    demo = pd.DataFrame(0, index=[0], columns=feature_columns)

    # Numeric features
    mapping = {
        "land area": data.get("Land Area", 0),
        "bedrooms": data.get("Bedrooms", 0),
        "toilets": data.get("WC", 0),
        "total floors": data.get("Floors", 0)
    }
    for k, v in mapping.items():
        if k in demo.columns:
            demo.loc[0, k] = v

    # Categorical features
    cat_mapping = {
        "type of house": data.get("Type of House", ""),
        "location": data.get("location") or data.get("District", ""),
        "main door direction": data.get("House Direction", ""),
        "balcony direction": data.get("Balcony Direction", ""),
        "legal documents": data.get("Legal Status", "")
    }
    for cat, val in cat_mapping.items():
        col_name = f"{cat}_{val}"
        if col_name in demo.columns:
            demo.loc[0, col_name] = 1

    # ---------------------------
    # 2. Dự đoán giá
    # ---------------------------
    try:
        pred_price = float(model.predict(demo)[0])  # VND nguyên gốc
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # ---------------------------
    # 3. Xác định phường/quận dự đoán
    # ---------------------------
    location_cols = [c for c in demo.columns if c.startswith('location_') and demo.loc[0, c] == 1]
    if location_cols:
        predicted_location = location_cols[0].replace("location_", "")
        district = predicted_location.split(',')[-1].strip()
    else:
        predicted_location = "Unknown"
        district = "Unknown"

    # ---------------------------
    # 4. Tính giá trung bình từng phường trong quận
    # ---------------------------
    location_cols_same_district = [c for c in X_train.columns if c.startswith('location_') and district in c]
    avg_prices = {}
    for col in location_cols_same_district:
        mask = X_train[col] == 1
        if mask.sum() > 0:
            avg_prices[col.replace("location_", "")] = float(y_train[mask].mean())

    # ---------------------------
    # 5. Tính khu vực cùng tầm giá (±10%)
    # ---------------------------
    min_price = pred_price * 0.9
    max_price = pred_price * 1.1

    mask_similar = (y_train >= min_price) & (y_train <= max_price)
    X_similar = X_train[mask_similar]

    # Lấy tất cả cột location
    location_cols_all = [c for c in X_train.columns if c.startswith('location_')]

    # Tổng số nhà từng location, lấy top 8
    location_suggest = (
        X_similar[location_cols_all]
        .sum()
        .sort_values(ascending=False)
        .head(8)
        .to_dict()
    )

    # Chuyển tên cột thành format "Phường X"
    location_suggest = {k.replace('location_', ''): int(v) for k,v in location_suggest.items()}

    # ---------------------------
    # 6. Trả JSON
    # ---------------------------
    return jsonify({
        "predictedPrice": pred_price,
        "predictedLocation": predicted_location,
        "avgPrices": avg_prices,
        "locationSuggest": location_suggest
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
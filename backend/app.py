from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib

# =========================
# APP
# =========================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

# =========================
# LOAD MODEL
# =========================
model = joblib.load("model/coef_model.pkl")
encoders = joblib.load("model/encoders.pkl")
feature_cols = joblib.load("model/features.pkl")

# =========================
# LOAD PRICE DATASET
# =========================
price_df = pd.read_csv("buoc3.csv", encoding="utf-8-sig")
price_df.columns = price_df.columns.str.strip()

price_df["Price of m2"] = pd.to_numeric(
    price_df["Price of m2"], errors="coerce"
)
price_df["Land Area"] = pd.to_numeric(
    price_df["Land Area"], errors="coerce"
)

price_df = price_df.dropna(subset=["Price of m2", "Land Area"])

# =========================
# LOOKUP PRICE / m2 (MEDIAN)
# =========================
def lookup_price_per_m2(location, house_type):
    df = price_df.copy()

    if location:
        df = df[df["location"].str.contains(location, case=False, na=False)]

    if house_type:
        df = df[df["Type of House"] == house_type]

    # fallback theo loại nhà
    if df.empty and house_type:
        df = price_df[price_df["Type of House"] == house_type]

    # fallback toàn bộ
    if df.empty:
        df = price_df

    return float(df["Price of m2"].median())

# =========================
# CATEGORIES
# =========================
FIXED_DIRECTIONS = [
    "Đông", "Tây", "Nam", "Bắc"
]

@app.route("/categories", methods=["GET"])
def get_categories():
    categories = {}

    for col, encoder in encoders.items():

        if col in ["House Direction", "Balcony Direction"]:
            categories[col] = FIXED_DIRECTIONS
        else:
            categories[col] = list(encoder.classes_)

    return jsonify(categories)

# =========================
# PREDICT
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # ===== CHECK =====
        if "Land Area" not in data:
            return jsonify({"error": "Missing Land Area"}), 400

        land_area = float(data["Land Area"])
        location = data.get("location", "")
        house_type = data.get("Type of House", "")

        # ===== LOOKUP BASE PRICE =====
        price_m2 = lookup_price_per_m2(location, house_type)
        base_price = price_m2 * land_area   # TRIỆU

        # ===== BUILD FEATURE INPUT =====
        input_data = {}
        for col in feature_cols:
            input_data[col] = data.get(col, 0)

        df = pd.DataFrame([input_data])

        # ===== ENCODE CATEGORICAL =====
        for col, encoder in encoders.items():
            if col in df.columns:
                value = str(df.at[0, col]).strip()
                if value not in encoder.classes_:
                    value = encoder.classes_[0]
                df[col] = encoder.transform([value])

        # ===== CAST NUMERIC =====
        for col in ["Bedrooms", "WC", "Floors"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        df = df[feature_cols]

        # ===== PREDICT =====
        coef_log = model.predict(df)[0]
        coef = np.expm1(coef_log)

        final_price = base_price * coef

        return jsonify({
            "price_per_m2": round(price_m2 * 1_000_000, 0),      # VND
            "base_price": round(base_price * 1_000_000, 0),      # VND
            "predicted_price": round(final_price * 1_000_000, 0) # VND
        })

    except Exception as e:
        print("❌ Predict error:", e)
        return jsonify({"error": str(e)}), 500

# =========================
# HOME
# =========================
@app.route("/")
def home():
    return "House Price AI API Running"

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
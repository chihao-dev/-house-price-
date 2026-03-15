import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import HistGradientBoostingRegressor

# =============================
# LOAD DATA
# =============================
df = pd.read_csv("buoc6.csv", encoding="utf-8-sig")
df.columns = df.columns.str.strip()

print("📌 Columns in CSV:", list(df.columns))

# =============================
# RENAME COLUMNS (STANDARDIZE)
# =============================
df = df.rename(columns={
    "Location": "location",
    "Legal Documents": "Legal Status",
    "Toilets": "WC",
    "Total Floors": "Floors"
})

# =============================
# FIX PRICE OF M2  (TRIỆU / m2)
# =============================
if df["Price of m2"].dtype == "object":
    df["Price of m2"] = (
        df["Price of m2"]
        .astype(str)
        .str.lower()
        .str.replace("triệu/m²", "", regex=False)
        .str.replace("triệu/m2", "", regex=False)
        .str.replace(",", ".", regex=False)
        .str.strip()
    )
    df["Price of m2"] = pd.to_numeric(df["Price of m2"], errors="coerce")

# =============================
# TOTAL PRICE NUMBER (TRIỆU)
# =============================
if "Total Price Number" not in df.columns:
    if "Price Billion" in df.columns:
        # TỶ → TRIỆU
        df["Total Price Number"] = df["Price Billion"] * 1000
    elif "Total Price" in df.columns:
        # VND → TRIỆU
        df["Total Price Number"] = df["Total Price"] / 1_000_000
    else:
        raise ValueError("❌ Không tìm thấy cột giá tổng")

# =============================
# CAST NUMERIC
# =============================
numeric_cols = [
    "Price of m2",
    "Land Area",
    "Bedrooms",
    "WC",
    "Floors",
    "Total Price Number"
]

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# DROP ROWS WITH INVALID PRICE / AREA
df = df.dropna(subset=["Price of m2", "Land Area", "Total Price Number"])

# =============================
# BASE PRICE (TRIỆU)
# =============================
df["BasePrice"] = df["Price of m2"] * df["Land Area"]

# =============================
# TARGET = log( Total / Base )
# =============================
df["TargetCoef"] = np.log1p(
    df["Total Price Number"] / df["BasePrice"]
)

# =============================
# FEATURES
# =============================
feature_cols = [
    "Price of m2",      # BẮT BUỘC
    "Land Area",        # BẮT BUỘC
    "Bedrooms",
    "WC",
    "Floors",
    "Type of House",
    "location",
    "House Direction",
    "Balcony Direction",
    "Legal Status"
]

# =============================
# FILL MISSING COLUMNS
# =============================
DEFAULT_VALUES = {
    "Bedrooms": 0,
    "WC": 0,
    "Floors": 0,
    "House Direction": "Không rõ",
    "Balcony Direction": "Không rõ",
    "Legal Status": "Không rõ"
}

for col in feature_cols:
    if col not in df.columns:
        print(f"⚠️ Missing column → auto create: {col}")
        df[col] = DEFAULT_VALUES.get(col, "Không rõ")

# =============================
# FEATURES & TARGET
# =============================
X = df[feature_cols].copy()
y = df["TargetCoef"]

# =============================
# ENCODE CATEGORICAL
# =============================
encoders = {}

for col in X.columns:
    if X[col].dtype == "object":
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le

# =============================
# SPLIT
# =============================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# =============================
# MODEL
# =============================
model = HistGradientBoostingRegressor(
    max_depth=8,
    learning_rate=0.05,
    max_iter=300,
    min_samples_leaf=30,
    random_state=42
)

# =============================
# TRAIN
# =============================
model.fit(X_train, y_train)

# =============================
# EVALUATE
# =============================
pred = model.predict(X_test)
r2 = r2_score(y_test, pred)
print("✅ R2 (coef model):", round(r2, 4))

# =============================
# SAVE MODEL
# =============================
os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/coef_model.pkl")
joblib.dump(encoders, "model/encoders.pkl")
joblib.dump(feature_cols, "model/features.pkl")

print("🎉 TRAIN DONE – MODEL SAVED")
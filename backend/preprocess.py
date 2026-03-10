import re
import pandas as pd

# =============================
# Convert text price -> TRIỆU
# =============================
def extract_price(text):

    if pd.isna(text):
        return None

    if isinstance(text, (int, float)):
        return float(text)

    text = str(text).lower().replace(" ", "").replace(",", ".")

    # dạng: 3.5tỷ
    if "tỷ" in text:
        nums = re.findall(r"\d+\.?\d*", text)
        return float(nums[0]) * 1000 if nums else None

    # dạng: 850triệu
    if "triệu" in text:
        nums = re.findall(r"\d+\.?\d*", text)
        return float(nums[0]) if nums else None

    nums = re.findall(r"\d+\.?\d*", text)
    return float(nums[0]) if nums else None


# =============================
# Preprocess dataframe
# =============================
def preprocess_dataframe(df):

    df = df.copy()

    numeric_cols = [
        "Land Area",
        "Bedrooms",
        "WC",
        "Floors",
        "Price of m2",
        "Total Price Number"
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # loại cột chỉ để hiển thị
    drop_cols = [
        "Total Price",
        "Display Price",
        "Price Billion"
    ]

    for col in drop_cols:
        if col in df.columns:
            df = df.drop(columns=[col])

    df = df.dropna()
    return df
# preprocess.py
import pandas as pd
import numpy as np
import re

def convert_price(x):
    x = str(x).lower().replace(',', '.')
    if 'tỷ' in x:
        return float(re.findall(r'\d+\.?\d*', x)[0]) * 1e9
    elif 'triệu' in x:
        return float(re.findall(r'\d+\.?\d*', x)[0]) * 1e6
    return np.nan

def convert_area(x):
    x = str(x).replace(',', '.')
    match = re.findall(r'\d+\.?\d*', x)
    return float(match[0]) if match else np.nan

def preprocess_data(csv_path):
    df = pd.read_csv(csv_path)
    
    # Chuẩn hóa tên cột
    df.columns = df.columns.str.strip().str.lower()
    
    # Chuyển giá và diện tích
    df['price'] = df['price'].apply(convert_price)
    df['land area'] = df['land area'].apply(convert_area)
    
    # Số phòng ngủ và WC
    df['bedrooms'] = df['bedrooms'].str.extract(r'(\d+)').astype(float)
    df['toilets'] = df['toilets'].str.extract(r'(\d+)').astype(float)
    
    # Số tầng
    df['total floors'] = pd.to_numeric(df['total floors'], errors='coerce').fillna(0)
    
    # Xử lý missing
    df = df.dropna()
    
    # Lưu các cột gốc để lấy categories
    categorical_columns = ['type of house', 'main door direction', 'balcony direction', 'legal documents', 'location']
    
    # One-hot encode
    df_encoded = pd.get_dummies(df, drop_first=True)
    
    X = df_encoded.drop('price', axis=1)
    y = df_encoded['price']
    
    return X, y, df, categorical_columns
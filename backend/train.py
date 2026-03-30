# train.py
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from preprocess import preprocess_data

# -------------------------------
# 1. Load & preprocess
# -------------------------------
X, y, df_raw, cat_cols = preprocess_data('cleaned_real_estate.csv')

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------------------------
# 2. Train Random Forest
# -------------------------------
rf_model = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    random_state=42,
    min_samples_leaf=1,
    min_samples_split=10
)
rf_model.fit(X_train, y_train)

# -------------------------------
# 3. Save model + feature columns
# -------------------------------
with open('rf_model.pkl', 'wb') as f:
    pickle.dump(rf_model, f)

with open('feature_columns.pkl', 'wb') as f:
    pickle.dump(X_train.columns.tolist(), f)

# -------------------------------
# 4. Save categories for frontend
# -------------------------------
categories = {}
for col in cat_cols:
    categories[col] = sorted(df_raw[col].dropna().unique().tolist())

with open('categories.pkl', 'wb') as f:
    pickle.dump(categories, f)

print("✅ Training xong, model và categories đã lưu!")

# -------------------------------
# 5. Save X_train, y_train cho backend sử dụng
# -------------------------------
with open('X_train.pkl', 'wb') as f:
    pickle.dump(X_train, f)

with open('y_train.pkl', 'wb') as f:
    pickle.dump(y_train, f)

print("✅ X_train và y_train đã lưu xong!")
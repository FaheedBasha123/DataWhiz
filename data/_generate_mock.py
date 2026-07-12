"""Generate realistic mock CSVs as default (real datasets are in *_real.csv backups)."""
import pandas as pd
import numpy as np
from pathlib import Path

DATA = Path(__file__).parent
np.random.seed(42)

# ============== STUDENTS ==============
first = ["Rahul","Aman","Priya","Riya","Arjun","Sneha","Vikram","Ananya","Rohan","Diya","Karan","Isha","Aditya","Meera","Sahil","Tanya","Nikhil","Pooja","Harsh","Kavya","Manish","Ritu","Saurabh","Nidhi","Akash","Shruti","Varun","Neha","Ayush","Simran","Deepak","Aditi","Gaurav","Shreya","Mohit","Ankita","Yash","Palak","Rakesh","Swati","Abhishek","Megha","Siddharth","Tanvi","Chirag","Jiya","Aakash","Muskan","Bharat","Komal"]
last = ["Sharma","Verma","Patel","Kumar","Singh","Gupta","Reddy","Iyer","Nair","Khan","Das","Joshi","Mehta","Bose","Rao","Chopra","Malhotra","Saxena","Mukherjee","Banerjee"]
subjects = ["Mathematics","Physics","Chemistry","English","Computer Science"]

rows = []
for i in range(50):
    name = f"{np.random.choice(first)} {np.random.choice(last)}"
    base = np.random.normal(72, 12)
    rows.append({
        "StudentID": f"STU{1000+i}",
        "Name": name,
        "Mathematics": int(np.clip(base + np.random.normal(0, 8), 35, 99)),
        "Physics": int(np.clip(base + np.random.normal(0, 9), 35, 99)),
        "Chemistry": int(np.clip(base + np.random.normal(0, 8), 35, 99)),
        "English": int(np.clip(base + np.random.normal(2, 6), 35, 99)),
        "Computer Science": int(np.clip(base + np.random.normal(3, 10), 35, 99)),
        "Attendance": int(np.clip(np.random.normal(82, 10), 40, 100)),
        "Class": np.random.choice(["X-A","X-B","X-C","XI-A","XI-B","XII-A"]),
    })
df = pd.DataFrame(rows)
# inject a few NaN
for _ in range(3):
    df.loc[np.random.randint(0, 50), np.random.choice(subjects)] = np.nan
df.to_csv(DATA / "students.csv", index=False)
print(f"[OK] students.csv  {len(df)} rows")

# ============== SALES ==============
products = {
    "Laptop":      {"price": 55000, "category": "Electronics",  "weight": 0.15},
    "Smartphone":  {"price": 28000, "category": "Electronics",  "weight": 0.20},
    "Headphones":  {"price":  3500, "category": "Electronics",  "weight": 0.18},
    "Tablet":      {"price": 32000, "category": "Electronics",  "weight": 0.08},
    "Smartwatch":  {"price": 12000, "category": "Electronics",  "weight": 0.10},
    "Office Chair":{"price":  8500, "category": "Furniture",    "weight": 0.07},
    "Desk":        {"price": 15000, "category": "Furniture",    "weight": 0.05},
    "Bookshelf":   {"price":  6500, "category": "Furniture",    "weight": 0.04},
    "Notebook":    {"price":   250, "category": "Stationery",   "weight": 0.06},
    "Pen Set":     {"price":   450, "category": "Stationery",   "weight": 0.04},
    "Backpack":    {"price":  1800, "category": "Accessories",  "weight": 0.03},
}
pn = list(products.keys())
pw = [products[p]["weight"] for p in pn]

regions = ["North","South","East","West","Central"]
reps = ["Aarav Mehta","Diya Kapoor","Rohan Iyer","Sneha Bose","Karan Reddy","Priya Nair","Vikram Joshi","Ananya Sharma"]
channels = ["Online","Retail Store","Distributor"]
segments = ["B2B","B2C","Enterprise"]

start = pd.Timestamp("2024-01-01")
end = pd.Timestamp("2025-06-30")
days = (end - start).days

sales = []
for oid in range(1001, 1501):
    p = np.random.choice(pn, p=pw)
    price = products[p]["price"]
    qty = np.random.randint(1, 4) if price > 20000 else (np.random.randint(1, 8) if price > 1000 else np.random.randint(2, 15))
    amount = price * qty
    dt = start + pd.Timedelta(days=np.random.randint(0, days))
    if dt.month in [11, 12]:
        amount = int(amount * np.random.uniform(1.1, 1.4))
    sales.append({
        "OrderID": oid,
        "OrderDate": dt.strftime("%Y-%m-%d"),
        "Product": p,
        "Category": products[p]["category"],
        "Quantity": qty,
        "UnitPrice": price,
        "Sales": amount,
        "Region": np.random.choice(regions),
        "SalesRep": np.random.choice(reps),
        "Channel": np.random.choice(channels),
        "CustomerSegment": np.random.choice(segments),
    })

sdf = pd.DataFrame(sales)
# inject 2 NaN
sdf.loc[np.random.randint(0, 500), "Sales"] = np.nan
sdf.loc[np.random.randint(0, 500), "Region"] = np.nan
sdf.to_csv(DATA / "sales.csv", index=False)
print(f"[OK] sales.csv     {len(sdf)} rows")
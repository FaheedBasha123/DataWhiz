""" Mock CSVs as default (real datasets are in *_real.csv backups)."""
import pandas as pd
import numpy as np
from pathlib import Path

DATA = Path(__file__).parent
np.random.seed(42)

# Students
first = ["Rahul","Aman","Priya","Riya","Arjun","Sneha","Vikram","Ananya","Rohan","Diya","Karan","Isha","Aditya","Meera","Sahil","Tanya","Nikhil","Pooja","Harsh","Kavya","Manish","Ritu","Saurabh","Nidhi","Akash","Shruti","Varun","Neha","Ayush","Simran","Deepak","Aditi","Gaurav","Shreya","Mohit","Ankita","Yash","Palak","Rakesh","Swati","Abhishek","Megha","Siddharth","Tanvi","Chirag","Jiya","Aakash","Muskan","Bharat","Komal","Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan","Atharv","Advik","Pranav","Aditya","Aadhya","Anaya","Diya","Myra","Aaradhya","Saanvi","Anika","Pari","Aanya","Ananya","Ira","Anvi","Anaya","Kiara","Aadhya","Anjali","Sneha","Suhana","Nitya","Pihu","Riya","Aaradhya","Maryam","Kavya","Vanya","Apoorva","Aarna","Anika","Anaya","Drishti","Ishita","Khushi","Nandini","Srishti","Tanya","Tanvi","Aarna","Anvi","Aaradhya","Aadhya","Suhana","Myra","Anika","Pari","Aanya","Pihu","Riya","Saanvi","Anaya","Kiara","Aadhya","Anjali","Suhana","Nitya","Pihu","Maryam","Aarna","Anvi","Srishti","Tanya","Aarna","Anvi","Anaya","Drishti","Ishita","Khushi","Nandini","Srishti","Tanya","Tanvi"]
last = ["Sharma","Verma","Patel","Kumar","Singh","Gupta","Reddy","Iyer","Nair","Khan","Das","Joshi","Mehta","Bose","Rao","Chopra","Malhotra","Saxena","Mukherjee","Banerjee","Mehra","Kapoor","Bhat","Bajaj","Agarwal","Saxena","Pandit","Bhatt","Tiwari","Trivedi","Sastry","Iyengar","Ranganathan","Subramanian","Deshpande","Kulkarni","Joshi","Patil","Mhatre","Sawant","Naik","Rao","Shenoy","Kamath","Hegde","Bhat","Acharya","Pai","Shanbhag","Kini","Dharwadkar","Wagh","Jadhav","Deshmukh","Gaikwad","Salunkhe","Bhosale","Kadam","Pawar","Jagtap","Mane","Kumbhar","Barge","Patil","Gavali","Kharat","Sathe","Kale","Gore","Desai","Mane","Patil","Sawant","Naik","Shenoy","Kamath","Hegde","Bhat","Acharya","Pai","Shanbhag","Kini","Dharwadkar","Wagh","Jadhav","Deshmukh","Gaikwad","Salunkhe","Bhosale","Kadam","Pawar","Jagtap","Mane","Kumbhar","Barge","Patil","Gavali","Kharat","Sathe","Kale","Gore","Desai"]
subjects = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"]

sections = ["A", "B", "C", "D", "E"]
students_per_section = 40
n_students = students_per_section * len(sections)  # 200

rows = []
for i in range(n_students):
    section = sections[i // students_per_section]  # 0-39 → A, 40-79 → B, etc.
    name = f"{np.random.choice(first)} {np.random.choice(last)}"
    # Vary base ability across sections a bit (B has slight edge in this mock)
    section_bonus = {"A": -3, "B": 4, "C": 0, "D": -1, "E": 2}[section]
    base = np.random.normal(72 + section_bonus, 12)
    math     = int(np.clip(base + np.random.normal(0, 8), 35, 99))
    physics  = int(np.clip(base + np.random.normal(0, 9), 35, 99))
    chem     = int(np.clip(base + np.random.normal(0, 8), 35, 99))
    english  = int(np.clip(base + np.random.normal(2, 6), 35, 99))
    cs       = int(np.clip(base + np.random.normal(3, 10), 35, 99))
    attend   = int(np.clip(np.random.normal(82, 10), 40, 100))
    rows.append({
        "StudentID":   f"STU{1000 + i}",
        "Name":        name,
        "Mathematics": math,
        "Physics":     physics,
        "Chemistry":   chem,
        "English":     english,
        "Computer Science": cs,
        "Attendance":  attend,
        "Class":       "X",
        "Section":     f"X-{section}",
    })
df = pd.DataFrame(rows)
# inject a few NaN values (3-4) for cleaning practice
for _ in range(4):
    df.loc[np.random.randint(0, n_students), np.random.choice(subjects)] = np.nan

df.to_csv(DATA / "students.csv", index=False)
print(f"[OK] students.csv  {len(df)} rows ({students_per_section} per section x {len(sections)} sections, all Class X)")

# Sales
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
sdf.loc[np.random.randint(0, 500), "Sales"] = np.nan
sdf.loc[np.random.randint(0, 500), "Region"] = np.nan
sdf.to_csv(DATA / "sales.csv", index=False)
print(f"[OK] sales.csv     {len(sdf)} rows")
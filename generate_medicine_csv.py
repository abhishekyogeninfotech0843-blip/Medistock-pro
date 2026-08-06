import csv
import random
import datetime
from pathlib import Path

path = Path('medicine_inventory.csv')
headers = ['MedicineName', 'Category', 'Company', 'BatchNo', 'BuyPrice', 'SellingPrice', 'Stock', 'ExpiryDate', 'Barcode']
categories = ['Analgesic', 'Antibiotic', 'Antacid', 'Antiseptic', 'Antihistamine', 'Vitamin', 'Cardiac', 'Diabetes', 'Dermatology', 'Respiratory']
companies = ['MediPharm', 'HealthCorp', 'WellLife', 'PharmaPlus', 'BioHeal', 'CareGen', 'LifeMeds', 'NovaPharma', 'CureChem', 'PentaHealth']
start_date = datetime.date(2026, 1, 1)

with path.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(headers)

    for i in range(1, 1001):
        name = f'Product {i:04d}'
        category = random.choice(categories)
        company = random.choice(companies)
        batch = f'BATCH-{random.randint(1000,9999)}-{random.choice(["A","B","C","D","E"])}'
        buy = round(random.uniform(20, 500), 2)
        sell = round(buy * random.uniform(1.15, 1.5), 2)
        stock = random.randint(10, 500)
        expiry = start_date + datetime.timedelta(days=random.randint(90, 900))
        barcode = f'{random.randint(100000000000,999999999999)}'
        writer.writerow([name, category, company, batch, f'{buy:.2f}', f'{sell:.2f}', stock, expiry.isoformat(), barcode])

print(f'Created {path.resolve()} with 1000 medicine records.')

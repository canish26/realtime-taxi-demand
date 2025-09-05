import pandas as pd
import random
from datetime import datetime, timedelta

# Number of records
N = 50000  # large dataset

# NYC bounding box (approx)
lat_min, lat_max = 40.55, 40.95
lng_min, lng_max = -74.25, -73.70

start_time = datetime(2023, 1, 1, 0, 0, 0)
records = []

for i in range(N):
    # Random datetime within one day
    pickup_time = start_time + timedelta(seconds=random.randint(0, 86400))

    # Clustered around common taxi hotspots
    if random.random() < 0.6:  # Manhattan cluster
        lat = random.uniform(40.70, 40.82)
        lng = random.uniform(-74.02, -73.95)
    elif random.random() < 0.8:  # Brooklyn
        lat = random.uniform(40.65, 40.70)
        lng = random.uniform(-74.02, -73.90)
    else:  # Spread across NYC
        lat = random.uniform(lat_min, lat_max)
        lng = random.uniform(lng_min, lng_max)

    records.append([pickup_time.strftime("%Y-%m-%d %H:%M:%S"), lat, lng])

# Save to CSV
df = pd.DataFrame(records, columns=["pickup_datetime", "pickup_latitude", "pickup_longitude"])
df.to_csv("sample_tlc.csv", index=False)

print("✅ sample_tlc.csv with", N, "records")

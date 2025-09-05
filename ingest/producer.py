import os, time, json, pandas as pd
from kafka import KafkaProducer
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC = os.getenv('KAFKA_RIDES_TOPIC', 'rides')
SPEED = float(os.getenv('REPLAY_SPEED', '120.0')) # 120x real-time


producer = KafkaProducer(bootstrap_servers=[BROKER], value_serializer=lambda v: json.dumps(v).encode())


# Expect a CSV with columns: pickup_datetime, pickup_latitude, pickup_longitude
csv_path = os.getenv('CSV', 'sample_tlc.csv')
df = pd.read_csv(csv_path, usecols=['pickup_datetime','pickup_latitude','pickup_longitude']).dropna()


def row_to_event(r):
    ts = int(pd.to_datetime(r['pickup_datetime']).timestamp()*1000)
    return { 'lat': float(r['pickup_latitude']), 'lng': float(r['pickup_longitude']), 'ts': ts }


last_ts = None
for _, r in df.iterrows():
    e = row_to_event(r)
    if last_ts is not None:
        dt = max(0, (e['ts'] - last_ts) / SPEED)
        time.sleep(dt/1000)
    last_ts = e['ts']
    producer.send(TOPIC, e)
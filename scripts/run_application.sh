#!/bin/bash

# Check if Kafka and Zookeeper are running
if ! docker ps | grep -q kafka; then
  echo "Starting Kafka and Zookeeper..."
  docker-compose up -d
  echo "Waiting for Kafka to initialize..."
  sleep 10
fi

# Create topic if it doesn't exist
echo "Ensuring Kafka topic exists..."
docker exec kafka \
  kafka-topics --create \
  --topic rides \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1 \
  --if-not-exists

# Start the server (in new terminal)
echo "Starting server..."
cd server && npm run dev &
SERVER_PID=$!
sleep 2

# Start the frontend (in new terminal)
echo "Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!
sleep 2

echo "Application is now running!"
echo "- Server: http://localhost:4000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Would you like to start the data producer? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Starting data producer..."
  cd ingest && python producer.py
fi

# Handle cleanup when script is terminated
function cleanup {
  echo "Shutting down..."
  kill $SERVER_PID $FRONTEND_PID
}

trap cleanup EXIT
wait

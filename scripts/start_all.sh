#!/bin/bash

# Start Kafka and Zookeeper
echo "Starting Kafka and Zookeeper..."
docker-compose up -d

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 10

# Check if Kafka topic exists, create if not
echo "Checking/creating Kafka topics..."
docker exec kafka \
  kafka-topics --create \
  --topic rides \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1 \
  --if-not-exists

# Start the server in the background
echo "Starting server..."
cd server
npm run start &
SERVER_PID=$!
cd ..

# Start the frontend in the background
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "All components are starting up."
echo "Server running with PID: $SERVER_PID"
echo "Frontend running with PID: $FRONTEND_PID"
echo "To stop all components, press Ctrl+C"

# Wait for signals to properly terminate background processes
trap "kill $SERVER_PID $FRONTEND_PID; docker-compose down; exit" SIGINT SIGTERM

# Keep the script running
wait

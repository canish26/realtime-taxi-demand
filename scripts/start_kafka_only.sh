#!/bin/bash

# Stop any existing containers
echo "Stopping existing Kafka and Zookeeper containers..."
docker-compose down

# Start containers
echo "Starting Kafka and Zookeeper..."
docker-compose up -d

# Wait for Kafka to initialize
echo "Waiting for Kafka to initialize (this may take up to 30 seconds)..."
sleep 30

# Create the topic
echo "Creating 'rides' topic..."
docker exec kafka \
  kafka-topics --create \
  --topic rides \
  --bootstrap-server kafka:29092 \
  --partitions 1 \
  --replication-factor 1 \
  --if-not-exists

# List topics
echo "Topics created:"
docker exec kafka \
  kafka-topics --list \
  --bootstrap-server kafka:29092

echo "Kafka is ready at localhost:9092"
echo "Your application can now connect to this Kafka instance"

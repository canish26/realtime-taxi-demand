#!/bin/bash

echo "Waiting for Kafka to be ready..."
sleep 20

echo "Creating 'rides' topic..."
docker exec kafka \
  kafka-topics --create \
  --topic rides \
  --bootstrap-server kafka:29092 \
  --partitions 1 \
  --replication-factor 1 \
  --if-not-exists

echo "Topics created:"
docker exec kafka \
  kafka-topics --list \
  --bootstrap-server kafka:29092

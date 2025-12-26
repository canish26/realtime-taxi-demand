# 1) Clone
git clone realtime-taxi-demand.git
cd realtime-taxi-demand


# 2) Env
cp .env.example .env


# 3) Install deps
cd server && pnpm i && cd ../frontend && pnpm i && cd ..


# 4) Run server and frontend (two terminals) OR use scripts/dev.sh
cd server && pnpm dev
# new terminal
cd frontend && pnpm dev
# Realtime Taxi Demand Monitoring

A realtime data processing application for monitoring taxi demand patterns.

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- Python (3.7+)
- Docker and Docker Compose

### Kafka Setup

1. Start Kafka and Zookeeper:
   ```
   docker-compose up -d
   ```

2. Initialize Kafka topics (first time only):
   ```
   chmod +x scripts/init_kafka.sh
   ./scripts/init_kafka.sh
   ```

### Backend Setup

1. Navigate to the server directory and install dependencies:
   ```
   cd server
   npm install
   ```

2. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```
   npm run dev
   ```

### Data Ingestion

To start sending taxi data to Kafka:

# Open http://localhost:5173

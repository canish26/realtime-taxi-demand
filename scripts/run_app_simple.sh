#!/bin/bash

# Kill any existing processes on ports 3000 and 4001
echo "Checking for processes on ports 3000 and 4001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4001 | xargs kill -9 2>/dev/null

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start the server
echo "Starting server on port 4001..."
cd server
npm run dev &
SERVER_PID=$!
sleep 2

# Start the frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "Application is now running!"
echo "- Server: http://localhost:4001"
echo "- Frontend should be available at http://localhost:3000 (check terminal output for actual port)"

# Handle cleanup when script is terminated
function cleanup {
  echo "Shutting down..."
  kill $SERVER_PID $FRONTEND_PID
}

trap cleanup EXIT
wait

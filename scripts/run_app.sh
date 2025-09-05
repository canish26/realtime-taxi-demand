#!/bin/bash

# Kill any existing processes on ports 3000 and 4000
echo "Checking for processes on ports 3000 and 4000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null

# Make sure port 4000 is definitely free
sleep 1

# Start the server on port 4000
echo "Starting server on port 4000..."
cd server
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3
echo "Server started on port 4000"

# Start the frontend on port 3000
echo "Starting frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Application is now running!"
echo "- Server: http://localhost:4000"
echo "- Frontend: http://localhost:3000"

# Handle cleanup when script is terminated
function cleanup {
  echo "Shutting down..."
  kill $SERVER_PID $FRONTEND_PID 2>/dev/null
}

trap cleanup EXIT
wait

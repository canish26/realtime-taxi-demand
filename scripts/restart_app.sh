#!/bin/bash

# Kill any existing processes on ports 3000 and 4001
echo "Stopping any existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4001 | xargs kill -9 2>/dev/null
sleep 1

# Start the server
echo "Starting server on port 4001..."
cd server && npm run dev &
SERVER_PID=$!
sleep 3

# Start the frontend
echo "Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Application is now running!"
echo "- Server: http://localhost:4001"
echo "- Frontend: Check the terminal output for the actual port"
echo "- Server API test: Try opening http://localhost:4001 in your browser"

# Handle cleanup when script is terminated
function cleanup {
  echo "Shutting down..."
  kill $SERVER_PID $FRONTEND_PID 2>/dev/null
}

trap cleanup EXIT
wait

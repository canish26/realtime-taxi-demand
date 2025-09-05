#!/bin/bash

# Kill any existing frontend process on port 3000
echo "Stopping frontend on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait a moment to ensure the port is released
sleep 1

# Navigate to frontend directory
cd frontend

# Start the frontend
echo "Starting frontend..."
npm run dev

echo "Frontend should now be running at http://localhost:3000"

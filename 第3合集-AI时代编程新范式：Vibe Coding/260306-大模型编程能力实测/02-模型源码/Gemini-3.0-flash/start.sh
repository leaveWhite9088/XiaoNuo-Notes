#!/bin/bash

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
python3 main.py &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Bilibili Clone is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"

# Handle termination
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait

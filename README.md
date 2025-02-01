# Smart Home Mental Health System

A real-time system that analyzes Apple Watch data and adjusts the environment (lights, music, temperature) based on the user's mental state.

## Features

- Real-time Apple Watch data simulation
- Mental state analysis using OpenAI
- Philips Hue light control
- Music recommendations
- Environment optimization
- WebSocket real-time updates

## Setup

1. Clone the repository:
```bash
git clone https://github.com/irfank123/hamood.git
cd hamood
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```env
WATCH_PORT=3004
WATCH_WS_PORT=8084
ENV_PORT=3005
ENV_WS_PORT=8085
OPENAI_API_KEY=your_openai_key_here
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Watch Analysis Service (Port 3004)
- `GET /api/watch-data` - Get current watch data
- `POST /api/analyze` - Analyze watch data with user input
- `GET /health/watch` - Health check

### Environment Service (Port 3005)
- `POST /api/environment` - Update environment settings
- `GET /api/hue/status` - Get Hue connection status
- `GET /health/environment` - Health check

## WebSocket Connections
- Watch Data: `ws://localhost:8084`
- Environment Updates: `ws://localhost:8085`
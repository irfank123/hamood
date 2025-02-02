# Hamood - Smart Home Mental Health Assistant

A smart home system that uses real-time health data to analyze mental states and automatically adjust environmental conditions for improved wellbeing. The system integrates with wearable devices, smart lighting, and music services to create an adaptive, therapeutic environment.

## Features

- **Real-time Health Monitoring**
  - Heart rate tracking
  - Breathing rate analysis
  - Activity level monitoring
  - Temperature sensing

- **AI-Powered Mental State Analysis**
  - Stress level detection
  - Confidence scoring
  - Contextual pattern recognition
  - Personalized recommendations

- **Automated Environment Control**
  - Dynamic lighting adjustment based on mental state
  - Music selection through Last.fm integration
  - Temperature optimization
  - Real-time environment updates

- **Interactive Dashboard**
  - Live health metrics visualization
  - Mental state analysis display
  - Manual environment controls
  - Historical data analytics

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, WebSocket
- **AI Integration**: OpenAI API
- **External Services**: Last.fm API, Philips Hue API

## Installation

1. Clone the repository
```bash
git clone https://github.com/irfank123/hamood.git
cd hamood
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In backend/.env
PORT=3004
LASTFM_API_KEY=your_key
LASTFM_API_SECRET=your_secret
OPENAI_API_KEY=your_key
```

4. Install shadcn/ui components
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
```

## Running the Application

1. Start the backend server
```bash
cd backend
npm run start
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

```
hamood/
├── backend/
│   └── src/
│       ├── services/
│       │   ├── watchSimulator.js
│       │   ├── openaiService.js
│       │   ├── hueService.js
│       │   └── musicService.js
│       ├── routes/
│       │   ├── analysisApi.js
│       │   └── environmentApi.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/
        │   └── LivingRoomSimulator.jsx
        └── App.jsx
```

## How It Works

1. **Data Collection**: The system receives real-time health data from wearable devices (simulated in development).

2. **Analysis**: OpenAI processes the health data to determine the user's mental state with confidence scoring.

3. **Environment Adjustment**: Based on the analysis, the system automatically adjusts:
   - Lighting colors (therapeutic color selection)
   - Music selection
   - Room temperature

4. **User Feedback**: The system learns from user feedback to improve future recommendations.

## Color Therapy Implementation

The system uses evidence-based color therapy principles to promote wellbeing:

- **Stressed State**: Soft blues (#E6F3FF) to reduce stress and lower heart rate
- **Neutral State**: Gentle greens (#E8F5E9) to promote focus and balance
- **Relaxed State**: Warm lavender (#E6E6FA) to maintain calmness

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.

## Future Development

- Integration with more smart home devices
- Enhanced AI analysis capabilities
- Mobile app development
- User profiles and personalization
- Extended health metrics analysis

## Contact

For questions or feedback, please open an issue on the [GitHub repository](https://github.com/irfank123/hamood)
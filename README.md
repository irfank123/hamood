# Hamood - Smart Home Mental Health Assistant

A prototype simulation of an AI-powered smart home system that uses real-time health data to analyze mental states and automatically adjusts environmental conditions for improved wellbeing. While currently implemented as a living room simulation, the system is designed to be integrated with real smart home devices and wearable technology.

## Demo Environment

The current implementation provides a simulated living room environment to demonstrate the system's capabilities:
- Simulated smart lighting system
- Virtual music playback system
- Mock health data streaming
- Real-time environment visualization

In a production environment, these simulated components would be replaced with:
- Real smart home device integration
- Actual wearable device data
- Physical lighting systems
- Home audio systems

## Features

- **Real-time Health Monitoring**
  - Heart rate tracking
  - Breathing rate analysis
  - Activity level monitoring
  - Temperature sensing

- **AI-Powered Mental State Analysis**
  - Stress level detection with confidence scoring
  - Real-time mental state monitoring
  - Contextual pattern recognition
  - Personalized recommendations

- **Simulated Environment Control**
  - Dynamic lighting adjustment based on mental state
  - AI-powered personalized music selection
  - Real-time environment updates
  - Interactive room simulation

- **Interactive Dashboard**
  - Live health metrics visualization
  - Mental state analysis display
  - Manual environment controls
  - Historical data analytics

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, WebSocket
- **AI Integration**: OpenAI API
- **Music System**: AI-powered music recommendation and generation
- **Simulated IoT**: Custom light and environment simulation

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

1. **Data Collection**: The system receives real-time health data from simulated wearable devices.

2. **Analysis**: OpenAI processes the health data to determine the user's mental state with confidence scoring.

3. **Environment Adjustment**: Based on the analysis, the system automatically:
   - Adjusts lighting colors using therapeutic color principles
   - Selects or generates personalized music based on mood and preferences
   - Updates the room simulation in real-time

4. **User Feedback**: The system learns from user feedback to improve future recommendations.

## Color Therapy Implementation

The system uses carefully selected colors to promote wellbeing:

- **Stressed State**: Light Blue (#ADD8E6) - promotes calmness and reduces anxiety
- **Neutral State**: Light Green (#90EE90) - encourages balance and stability
- **Relaxed State**: Thistle (#D8BFD8) - maintains relaxation and peaceful state

## Personalized Music System

The system features an advanced music personalization system that:
- Learns user music preferences over time
- Adapts to different times of day
- Considers current activity and mental state
- Allows manual overrides and favorites
- Generates mood-appropriate music based on:
  - **Stressed**: Calming, slower tempo compositions matching user preferences
  - **Neutral**: Balanced, moderate tempo pieces aligned with user taste
  - **Relaxed**: Gentle, uplifting melodies personalized to user style

Users can:
- Set preferred genres for each mental state
- Create custom playlists for different moods
- Adjust music parameters (tempo, volume, style)
- Rate and provide feedback on selections

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.

## Future Development

- Integration with real IoT devices
- Enhanced AI analysis capabilities
- Mobile app development
- User profiles and personalization
- Extended health metrics analysis
- Advanced music generation algorithms
- Integration with popular smart home platforms
- Support for multiple rooms and zones
- Multi-user support

## Contact

For questions or feedback, please open an issue on the [GitHub repository](https://github.com/irfank123/hamood)
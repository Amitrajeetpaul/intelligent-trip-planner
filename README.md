# Intelligent Trip Planner (TRIPSYNC)

An AI-powered travel planning application that helps users create personalized trip itineraries with intelligent suggestions, packing lists, and safety information.

## 🚀 Features

- **AI-Powered Trip Generation**: Create complete trip plans using OpenAI
- **Flexible Planning Modes**: 
  - Specific mode: Define destination and exact dates
  - Flexible mode: Choose a month and get AI destination suggestions
- **Personalized Itineraries**: Day-by-day activities based on travel personality
- **Smart Packing Lists**: Categorized packing suggestions with checkbox tracking
- **Safety Information**: Destination safety scores and warnings
- **User Authentication**: Secure login and session management

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Tailwind CSS + Radix UI
- Framer Motion (animations)

### Backend
- Node.js + Express 5
- PostgreSQL + Drizzle ORM
- Passport.js (authentication)
- OpenAI API integration

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Intelligent-Trip-Planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AI_INTEGRATIONS_OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET`: A random string for session encryption

4. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utility functions
├── server/              # Backend Express application
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Database connection
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Database schema
│   └── routes.ts        # API contract definitions
└── package.json         # Dependencies and scripts
```

## 🔑 API Endpoints

### Trips
- `GET /api/trips` - List user's trips
- `POST /api/trips` - Create trip manually
- `GET /api/trips/:id` - Get trip details
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/generate` - Generate AI trip

### Packing
- `PATCH /api/packing/:id` - Toggle packing item

### Authentication
- `/api/login` - User login
- `/api/logout` - User logout
- `/api/user` - Get current user

## 🎨 Travel Personalities

The app supports three travel personality types:

1. **Adventure Seeker**: Hiking, outdoor activities, and thrill
2. **Budget Traveler**: Cost-effective stays, local food, free spots
3. **Family Vacation**: Kid-friendly spots, relaxed pace, comfort

## 🔒 Security Features

- ✅ Passport.js authentication
- ✅ Session-based authorization
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Drizzle ORM
- ✅ Environment variable validation
- ✅ Proper authorization checks on all endpoints

## 🧪 Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run check      # Type check with TypeScript
npm run db:push    # Push database schema
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | Yes |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI API base URL | No |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `SESSION_SECRET` | Session encryption secret | Yes |

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database user has proper permissions

### OpenAI API Errors
- Verify your API key is valid
- Check you have sufficient API credits
- Ensure you're using a supported model (gpt-4o, gpt-4, gpt-3.5-turbo)

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear TypeScript cache: `rm -rf node_modules/typescript/tsbuildinfo`

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

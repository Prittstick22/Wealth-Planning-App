# Wealth Planning App

A modern, full-stack wealth planning application for calculating investment growth, retirement withdrawals, and time-to-target goals.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Recharts for visualization
- Axios for HTTP requests

### Backend
- Python FastAPI
- SQLAlchemy ORM
- PostgreSQL database
- Pydantic for validation

## Project Structure

```
wealth-planning-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Pydantic models
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── main.py          # FastAPI app
│   │   └── config.py        # Configuration
│   └── requirements.txt
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/      # React components
    │   ├── services/        # API client
    │   ├── hooks/           # Custom hooks
    │   ├── types/           # TypeScript types
    │   └── App.tsx          # Main app
    └── package.json
```

## Features

### 1. Compound Growth Calculator
Calculate portfolio growth with contributions over time:
- Starting amount
- Annual interest rate and compounding frequency
- Periodic contributions
- Visual timeline and yearly breakdown

### 2. Withdrawal Run-Out Calculator
Determine when funds run out with periodic withdrawals:
- Starting portfolio
- Interest rate
- Withdrawal schedule
- Runout timeline projection

### 3. Time-to-Target Calculator
Calculate time needed to reach a retirement goal:
- Current savings
- Contribution plan
- Target monthly withdrawal
- Time projection

## Getting Started

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Update if backend is not on localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

## API Endpoints

- `POST /calculate/growth` - Calculate compound growth
- `POST /calculate/withdrawal` - Calculate withdrawal runout
- `POST /calculate/time-to-target` - Calculate time to target
- `GET /health` - Health check

## Code Quality

- TypeScript for type safety
- Python type hints throughout
- Clean separation of concerns
- Modular, reusable components
- Production-ready patterns

## Next Steps

- [ ] Implement Withdrawal Calculator
- [ ] Implement Time-to-Target Calculator
- [ ] Add user authentication
- [ ] Add plan saving functionality
- [ ] Add historical data support
- [ ] Add export functionality (PDF, CSV)

## License

MIT

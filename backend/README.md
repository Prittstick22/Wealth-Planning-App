# Wealth Planning API Backend

FastAPI backend for wealth planning calculators.

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   ```

4. **Run server:**
   ```bash
   uvicorn app.main:app --reload
   ```

Server will be available at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## Project Structure

- `app/routes/` - API endpoints
- `app/schemas/` - Pydantic request/response models
- `app/services/` - Business logic and calculations
- `app/models/` - SQLAlchemy database models
- `app/config.py` - Configuration management
- `app/database.py` - Database setup

## API Endpoints

### POST /calculate/growth
Calculate compound growth with contributions.

Request:
```json
{
  "starting_amount": 10000,
  "annual_rate": 5,
  "compounding_frequency": "monthly",
  "contribution_amount": 500,
  "contribution_frequency": "monthly",
  "years": 10,
  "months": 0,
  "include_breakdown": false
}
```

Response:
```json
{
  "summary": {
    "final_balance": 80000,
    "total_contributions": 60000,
    "total_interest": 10000,
    "duration_years": 10,
    "duration_months": 0
  },
  "chart_data": [...],
  "breakdown": null
}
```

### POST /calculate/withdrawal
Calculate withdrawal runout timeline.

### POST /calculate/time-to-target
Calculate time to reach portfolio goal.

## Database

Setup PostgreSQL and update connection string in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/wealth_planning
```

## Notes

- All calculations use monthly simulation internally
- Compounding and contributions applied according to specified frequencies
- Results include detailed month-by-month timeline for charting

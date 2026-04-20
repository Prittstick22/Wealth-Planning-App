# 🔄 Data Flow & Architecture Diagram

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
│                    (http://localhost:5173)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/JSON
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. GrowthCalculator Component                               │  │
│  │    ├─ Form inputs (starting amount, rate, etc.)            │  │
│  │    ├─ State management (useState)                          │  │
│  │    └─ Calls: calculatorAPI.calculateGrowth()              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 2. API Client (services/api.ts)                             │  │
│  │    └─ Axios → POST /calculate/growth                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 3. Result Display                                            │  │
│  │    ├─ SummaryCard: Shows final balance, total interest      │  │
│  │    ├─ ChartPanel: Recharts line chart of timeline           │  │
│  │    └─ BreakdownTable: Yearly summary                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ POST /calculate/growth
                             │ {starting_amount, annual_rate, ...}
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                                  │
│              (http://localhost:8000)                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. Route Handler (routes/calculators.py)                    │  │
│  │    └─ Receives request, validates with Pydantic            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 2. Calculator Service (services/calculator_service.py)      │  │
│  │    ├─ Calls FinancialEngine                                 │  │
│  │    └─ Formats response JSON                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 3. Financial Engine (services/financial_engine.py)          │  │
│  │    ├─ Calculate monthly rate from annual                    │  │
│  │    ├─ Simulate month-by-month:                             │  │
│  │    │  ├─ Calculate interest                                 │  │
│  │    │  ├─ Apply contribution if due                         │  │
│  │    │  ├─ Update balance                                    │  │
│  │    │  └─ Store MonthlySnapshot                             │  │
│  │    └─ Return: timeline, final_balance, total_interest      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 4. Response (JSON)                                           │  │
│  │    {                                                         │  │
│  │      "summary": {                                            │  │
│  │        "final_balance": 80000,                              │  │
│  │        "total_contributions": 60000,                        │  │
│  │        "total_interest": 10000                              │  │
│  │      },                                                      │  │
│  │      "chart_data": [                                        │  │
│  │        {"month": 1, "ending_balance": 10541.67, ...},       │  │
│  │        {"month": 2, "ending_balance": 11087.78, ...},       │  │
│  │        ...                                                   │  │
│  │      ]                                                       │  │
│  │    }                                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Response (JSON)
                             ▼
                     [Returns to Frontend]
                             │
                             ▼
                      Display Results
                      Update Chart
                      Show Summary
```

---

## Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   ├── Sidebar (desktop) / MobileTabs (mobile)
│   └── Main Content Area
│       └── GrowthCalculator (or other calculators)
│           ├── Left Column (Sticky Form)
│           │   ├── FormSection
│           │   │   ├── FormInput × 6
│           │   │   └── FormSelect × 2
│           │   └── Calculate & Reset Buttons
│           └── Right Column (Results)
│               ├── Loading / ErrorMessage / EmptyState (conditional)
│               ├── SummaryCard × 4
│               ├── ChartPanel (Recharts)
│               └── BreakdownTable (optional)
```

---

## Module Dependencies

```
Frontend Modules:
├── services/api.ts
│   ├── axios
│   └── types/calculator.ts
├── components/calculators/GrowthCalculator.tsx
│   ├── services/api.ts
│   ├── services/formatting.ts
│   ├── components/forms/index.tsx
│   ├── components/results/SummaryCard.tsx
│   ├── components/results/ChartPanel.tsx
│   ├── components/common/index.tsx
│   └── hooks/useCalculator.ts
├── types/calculator.ts
│   └── [Pydantic models from backend]
└── styling
    └── tailwindcss

Backend Modules:
├── app/main.py (FastAPI app)
├── app/routes/calculators.py
│   ├── app/schemas/growth.py (Pydantic)
│   └── app/services/calculator_service.py
├── app/services/calculator_service.py
│   └── app/services/financial_engine.py
├── app/config.py
└── app/database.py
    ├── app/models/user.py (SQLAlchemy)
    └── app/models/plan.py (SQLAlchemy)
```

---

## Request/Response Cycle

### Growth Calculator Flow

```
1. USER INPUT
   └─ Form: starting_amount=10000, annual_rate=5, etc.

2. FRONTEND PROCESSING
   ├─ React Component: GrowthCalculator.tsx
   ├─ State: setFormData()
   └─ Event Handler: handleCalculate()

3. API CALL
   ├─ services/api.ts
   ├─ Axios POST to http://localhost:8000/calculate/growth
   └─ Body: { starting_amount: 10000, annual_rate: 5, ... }

4. BACKEND ROUTE
   ├─ routes/calculators.py: @router.post("/growth")
   ├─ Pydantic: GrowthRequest model validates input
   └─ Calls: CalculatorService.calculate_growth_plan()

5. CALCULATION ENGINE
   ├─ financial_engine.py: calculate_growth()
   ├─ Loop: for each month in duration
   │   ├─ Calculate interest: balance * monthly_rate
   │   ├─ Apply contribution: if month % frequency == 0
   │   └─ Store: MonthlySnapshot
   ├─ Returns: (timeline, final_balance, total_contributions, total_interest)
   └─ Result: List[MonthlySnapshot] with 120 months

6. SERVICE FORMATTING
   ├─ calculator_service.py: format_timeline_for_response()
   ├─ Converts: MonthlySnapshot → JSON-serializable dict
   └─ Builds: {summary: {...}, chart_data: [...]}

7. API RESPONSE
   └─ FastAPI returns: GrowthResponse (Pydantic model)
   {
     "summary": {
       "final_balance": 80000.00,
       "total_contributions": 60000.00,
       "total_interest": 10000.00,
       "duration_years": 10,
       "duration_months": 0
     },
     "chart_data": [
       {"month": 1, "date": "2026-04-19", "beginning_balance": 10000, ...},
       ...
     ]
   }

8. FRONTEND RECEIVES
   ├─ Axios resolves: response.data
   ├─ React: setResult(response)
   └─ State updates (triggers re-render)

9. RENDER RESULTS
   ├─ Loading state → Hidden
   ├─ SummaryCard × 4 → Display metrics
   ├─ ChartPanel → Draw Recharts line chart
   └─ BreakdownTable → Optional yearly data

10. USER SEES
    ├─ Summary cards with key metrics
    ├─ Interactive chart showing growth over time
    ├─ Yearly breakdown table
    └─ Can interact: hover chart, scroll table, etc.
```

---

## Data Structures

### Monthly Snapshot (Backend)
```python
@dataclass
class MonthlySnapshot:
    month: int                  # 1-120
    date: datetime              # 2026-04-19, 2026-05-19, ...
    beginning_balance: float    # $10,000.00
    contribution: float         # $500.00 (if due)
    interest: float             # $41.67
    withdrawal: float           # $0.00
    ending_balance: float       # $10,541.67
```

### Growth Response (Frontend)
```typescript
interface GrowthResponse {
  summary: {
    final_balance: number;           // 80000
    total_contributions: number;     // 60000
    total_interest: number;          // 10000
    duration_years: number;          // 10
    duration_months: number;         // 0
  };
  chart_data: TimelineDataPoint[];  // 120 points
  breakdown?: Array<{               // Optional
    year: number;
    total_contributions: number;
    total_interest: number;
    ending_balance: number;
  }>;
}
```

---

## Calculation Sequence (Month 1)

```
Input: starting_amount=10000, annual_rate=5%, monthly contribution=500

Calculate monthly_rate:
  annual_rate_decimal = 5 / 100 = 0.05
  monthly_rate = 0.05 / 12 = 0.00416667

Month 1:
  1. beginning_balance = 10,000.00
  2. interest = 10,000.00 × 0.00416667 = 41.67
  3. contribution = 500.00 (since month 1 % 1 == 0)
  4. ending_balance = 10,000.00 + 41.67 + 500.00 = 10,541.67

Month 2:
  1. beginning_balance = 10,541.67
  2. interest = 10,541.67 × 0.00416667 = 43.92
  3. contribution = 500.00
  4. ending_balance = 10,541.67 + 43.92 + 500.00 = 11,085.59

... (continue for all 120 months)

After 120 months:
  - final_balance ≈ $80,000
  - total_contributions = $60,000 (500 × 120)
  - total_interest ≈ $20,000
```

---

## Technology Stack Map

```
Frontend Layer:
  TypeScript
  ├── React 18
  │   ├── Components (JSX)
  │   ├── Hooks (useState)
  │   └── Events (onClick, onChange)
  ├── Axios (HTTP)
  ├── Recharts (Charts)
  └── Tailwind CSS (Styling)

Backend Layer:
  Python
  ├── FastAPI (Web framework)
  │   ├── Routing (@router.post)
  │   ├── CORS (Cross-origin)
  │   └── Docs (Swagger UI)
  ├── Pydantic (Validation)
  ├── SQLAlchemy (ORM)
  ├── PostgreSQL (Database)
  └── Uvicorn (Server)

Data Exchange:
  JSON ←→ HTTP ←→ REST API

Hosting/Deployment:
  Frontend: Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront
  Backend: Heroku, AWS EC2, Google Cloud Run, DigitalOcean
  Database: AWS RDS, Google Cloud SQL, PostgreSQL Cloud
```

---

**This architecture is scalable, maintainable, and production-ready!**

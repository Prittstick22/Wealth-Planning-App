# Wealth Planning Frontend

React + TypeScript + Vite application for financial planning calculations.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

## Project Structure

- `src/components/` - React components
  - `layout/` - App layout components
  - `calculators/` - Calculator pages
  - `forms/` - Form inputs
  - `results/` - Result display components
  - `common/` - Shared utilities
- `src/services/` - API client and utilities
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript types

## Features

- Modern dashboard layout with sidebar/tabs
- Three financial calculators
- Interactive charts using Recharts
- Responsive design with Tailwind CSS
- Type-safe with TypeScript

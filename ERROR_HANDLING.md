# Error Handling & Logging System Documentation

## Overview
This document describes the comprehensive error handling and logging system implemented in the Wealth Planning App.

## HTTP Status Codes & Error Mapping

| Status Code | Meaning | Error Code | User Message |
|-----------|---------|-----------|--------------|
| 400 | Bad Request | ERR_INVALID_INPUT | "Invalid input provided" |
| 422 | Unprocessable Entity | ERR_VALIDATION | "Validation error in your input" |
| 500 | Internal Server Error | ERR_SERVER | "An error occurred on the server" |

## Backend Error Handling

### Error Codes Reference
Each error has a standardized error code format: `ERR_<ERROR_TYPE>`

| Error Code | Message | User Message | Status Code |
|-----------|---------|--------------|------------|
| `ERR_VALIDATION` | Pydantic validation error | Field-specific validation message | 422 |
| `ERR_INVALID_AMOUNT` | Invalid amount provided | Please enter a valid amount (must be a positive number) | 400 |
| `ERR_INVALID_RATE` | Invalid interest rate | Interest rate must be between 0% and 100% | 400 |
| `ERR_INVALID_FREQUENCY` | Invalid frequency specified | Frequency must be 'monthly', 'quarterly', or 'annually' | 400 |
| `ERR_INVALID_DURATION` | Invalid duration | Years must be non-negative, and months must be between 0-11 | 400 |
| `ERR_ZERO_WITHDRAWAL` | Withdrawal amount cannot be zero | Please enter a withdrawal amount greater than 0 | 400 |
| `ERR_ZERO_CONTRIBUTION` | Contribution amount is zero | Contribution can be zero, but consider entering an amount to reach your goal faster | 400 |
| `ERR_CALCULATION_FAILED` | Calculation could not be completed | An error occurred during calculation. Please check your inputs and try again | 500 |
| `ERR_INTERNAL` | Internal server error | An unexpected error occurred. Please try again later or contact support | 500 |

### Logging System

#### Logger Configuration
- **Location**: `backend/app/utils/logger.py`
- **Log Level**: INFO and above
- **Output**: Console (stdout)
- **Format**: `[YYYY-MM-DD HH:MM:SS] LEVEL - Logger Name - Message`

#### Logging Functions
```python
from app.utils.logger import log_error, log_info, log_warning

# Log errors with error code
log_error(error_code="ERR_INVALID_AMOUNT", message="Growth calculation failed", details="Starting amount is negative")

# Log informational messages
log_info("Growth calculation successful: final_balance=$188,768.88")

# Log warnings
log_warning("High calculation duration requested: 50 years")
```

#### Logging Example Output
```
[2024-04-20 14:32:15] INFO - wealth-planning-api - Calculating growth with starting_amount=10000, annual_rate=5%
[2024-04-20 14:32:15] INFO - wealth-planning-api - Growth calculation successful: final_balance=188768.88
[2024-04-20 14:32:16] ERROR - [ERR_INVALID_AMOUNT] Growth calculation failed | Details: Starting amount must be non-negative
```

### Backend Input Validation

All calculator endpoints now validate inputs:

#### Growth Calculator Validation
```python
# Validates:
- starting_amount >= 0 (can be 0 - start with contributions)
- annual_rate >= 0 (no upper limit)
- contribution_amount >= 0
```

#### Withdrawal Calculator Validation
```python
# Validates:
- starting_amount > 0.01 (must have initial portfolio)
- withdrawal_amount > 0
- annual_rate >= 0 (no upper limit)
```

#### Time to Target Calculator Validation
```python
# Validates:
- starting_amount >= 0
- desired_monthly_withdrawal > 0
- annual_rate >= 0 (no upper limit)
- contribution_amount >= 0
```

### Pydantic Validation Error Handler

A global exception handler processes Pydantic validation errors and converts them to user-friendly messages:

```python
# File: backend/app/main.py
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError)
```

**Features:**
- Catches Pydantic validation errors (422 status)
- Extracts field name and error type
- Maps error types to user-friendly messages:
  - `greater_than`: "field must be greater than 0"
  - `greater_than_equal`: "field must be a positive number or 0"
  - `type_error`: "field must be a valid number"
- Logs validation errors to console
- Returns both technical and user-friendly error details

**Example Validation Error Response:**
```json
{
  "detail": [
    {
      "loc": ["body", "starting_amount"],
      "msg": "starting_amount must be greater than 0",
      "type": "greater_than"
    }
  ],
  "code": "ERR_VALIDATION",
  "message": "starting_amount must be greater than 0",
  "help": "Please check your input values. All fields must be filled with valid positive numbers."
}
```

## Frontend Error Handling

### Error Detail Structure
Errors are returned in a structured format:
```typescript
interface ErrorDetail {
  code?: string;        // Error code (e.g., "ERR_VALIDATION", "ERR_INVALID_INPUT")
  message?: string;     // User-friendly error message
  help?: string;        // Helpful guidance for the user
  details?: string;     // Technical details for debugging
}
```

### API Error Interceptor
- **Location**: `frontend/src/services/api.ts`
- **Functionality**: 
  - Intercepts all HTTP errors
  - Handles 422 Pydantic validation errors with special parsing
  - Handles 400 Bad Request errors
  - Handles 500 Server errors
  - Handles network errors (connection, timeout)
  - Logs errors to browser console for debugging
  - Converts all errors to structured ErrorDetail objects
  - Provides context-specific help text

**Error Interceptor Flow:**
```
HTTP Error
  ↓
Check Status Code
  ├─ 422: Validation Error → Parse Pydantic validation array → User message
  ├─ 400: Bad Request → Extract error detail string → User message
  ├─ 500: Server Error → Extract error detail string → User message
  ├─ Network: No response → Timeout or connection error → Network message
  └─ Other: Generic error → Standard error message
  ↓
Return ErrorDetail object to React component
```

**Console Output for Debugging:**
```javascript
// API interceptor logs all errors to console
console.error("API Error:", {
  status: 422,
  data: {
    detail: [...],
    code: "ERR_VALIDATION",
    message: "field must be greater than 0"
  },
  message: "Request failed with status code 422"
});
```

### Error Display Component
- **Location**: `frontend/src/components/common/index.tsx` → `ErrorMessage` component
- **Features**:
  - Displays user-friendly error message with ⚠️ icon
  - Shows helpful guidance text (💡)
  - Displays technical details for debugging (if available)
  - Shows error code for support reference
  - Professional styling with red color scheme

#### Error Message Display Example
```
⚠️ Validation error in your input
💡 Please check that all fields are filled with valid values (positive numbers)
Technical: [{"loc": ["body", "starting_amount"], "msg": "...", "type": "greater_than"}]
Error Code: ERR_VALIDATION
```

### Empty State Display
- **Location**: `frontend/src/components/common/index.tsx` → `EmptyState` component
- **Displays**: Helpful guidance for users when no calculation has been run

## Usage Examples

### Backend - Proper Error Handling
```python
# In routes/calculators.py
@router.post("/growth", response_model=GrowthResponse)
async def calculate_growth(request: GrowthRequest) -> GrowthResponse:
    try:
        log_info(f"Calculating growth with starting_amount={request.starting_amount}")
        
        # Validate inputs
        if request.starting_amount < 0:
            raise ValueError("Starting amount must be non-negative")
        
        result = CalculatorService.calculate_growth_plan(...)
        log_info(f"Success: final_balance={result['summary']['final_balance']}")
        return GrowthResponse(**result)
        
    except ValueError as e:
        log_error("ERR_INVALID_AMOUNT", "Growth calculation failed", str(e))
        raise HTTPException(status_code=400, detail=get_error_detail("ERR_INVALID_AMOUNT", str(e)))
    except Exception as e:
        log_error("ERR_CALCULATION_FAILED", "Growth calculation error", str(e))
        raise HTTPException(status_code=500, detail=get_error_detail("ERR_CALCULATION_FAILED"))
```

### Frontend - Handling Error Responses
```typescript
// In calculator components
const handleCalculate = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await calculatorAPI.calculateGrowth(sanitizedData);
    setResult(response);
  } catch (err: any) {
    // Error automatically parsed by API interceptor
    setError(err); // This is already an ErrorDetail object
  } finally {
    setLoading(false);
  }
};

// In JSX
{error && <ErrorMessage message={error} />}
```

## Best Practices

### Backend
1. **Always validate inputs** at the route level
2. **Log all calculations** with relevant parameters and results
3. **Use specific error codes** rather than generic messages
4. **Include technical details** in error logs for debugging
5. **Provide user-friendly messages** in error responses

### Frontend
1. **Pass error objects to ErrorMessage component** - don't try to extract strings
2. **Sanitize all numeric inputs** before API calls
3. **Allow empty strings** in forms - don't force 0
4. **Validate negative values** - prevent in input handlers
5. **Display ErrorMessage component** when error state is set

## Testing Error Scenarios

### Test Cases for Error Handling

#### Invalid Amount
```
Request: { starting_amount: -100, annual_rate: 5, ... }
Expected: ERR_INVALID_AMOUNT | Status: 400
Display: "Please enter a valid amount (must be a positive number)"
```

#### Invalid Rate
```
Request: { starting_amount: 10000, annual_rate: 150, ... }
Expected: ERR_INVALID_AMOUNT | Status: 400
Display: "Interest rate must be between 0% and 100%"
```

#### Zero Withdrawal
```
Request: { withdrawal_amount: 0, ... }
Expected: ERR_ZERO_WITHDRAWAL | Status: 400
Display: "Please enter a withdrawal amount greater than 0"
```

## Monitoring & Debugging

### Console Output
All logs are output to the console:
```bash
# Terminal shows:
[2024-04-20 14:32:15] INFO - wealth-planning-api - Starting Wealth Planning API v1.0.0
[2024-04-20 14:32:20] INFO - wealth-planning-api - Calculating growth with starting_amount=10000, annual_rate=5%
[2024-04-20 14:32:20] INFO - wealth-planning-api - Growth calculation successful: final_balance=188768.88
```

### Browser Developer Tools
- **Network Tab**: View API requests and error responses
- **Console**: See any client-side errors
- **Application/Storage**: Check any stored error states

## Future Enhancements

1. **File-based Logging**: Write logs to files for long-term storage
2. **Log Levels**: Add debug level for more detailed logging
3. **Error Tracking**: Integrate with error tracking service (Sentry, etc.)
4. **User Notifications**: Add toast notifications for non-blocking errors
5. **Error Recovery**: Implement auto-retry for transient errors
6. **Audit Trail**: Track all calculations for compliance

## Support

For issues with error handling:
1. Check the error code in the error message
2. Review this documentation for the error code definition
3. Check the backend logs for technical details
4. Check the browser console for frontend issues
5. Verify all inputs meet validation requirements

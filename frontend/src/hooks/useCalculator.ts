import { useState } from "react";
import { GrowthResponse, WithdrawalResponse, TimeToTargetResponse } from "../types/calculator";

interface ErrorDetail {
  code?: string;
  message?: string;
  help?: string;
  details?: string;
}

interface UseCalculatorState {
  data: GrowthResponse | WithdrawalResponse | TimeToTargetResponse | null;
  loading: boolean;
  error: string | ErrorDetail | null;
}

export const useCalculator = () => {
  const [state, setState] = useState<UseCalculatorState>({
    data: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setData = (
    data: GrowthResponse | WithdrawalResponse | TimeToTargetResponse | null
  ) => {
    setState({ data, loading: false, error: null });
  };

  const setError = (error: string | ErrorDetail) => {
    setState({ data: null, loading: false, error });
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, setLoading, setData, setError, reset };
};

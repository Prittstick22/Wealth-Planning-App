import axios, { AxiosInstance, AxiosError } from "axios";
import {
  GrowthRequest,
  GrowthResponse,
  WithdrawalRequest,
  WithdrawalResponse,
  TimeToTargetRequest,
  TimeToTargetResponse,
} from "../types/calculator";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Error response handler
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle error responses from server
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle 422 Validation Error (Pydantic validation)
      if (status === 422) {
        let validationMessage = "Validation error in your input";
        
        // Check for Pydantic validation error format (array)
        if (Array.isArray(data.detail)) {
          const firstError = data.detail[0];
          if (firstError.msg) {
            validationMessage = firstError.msg;
          } else if (firstError.message) {
            validationMessage = firstError.message;
          }
        } else if (data.detail) {
          validationMessage = typeof data.detail === "string" ? data.detail : "Validation error";
        }
        
        return Promise.reject({
          code: "ERR_VALIDATION",
          message: validationMessage,
          help: "Please check that all fields are filled with valid values (positive numbers)",
          details: data.detail ? JSON.stringify(data.detail) : "",
        });
      }

      // Handle 400 Bad Request
      if (status === 400) {
        const detail = data.detail;
        
        if (typeof detail === "object" && detail.code) {
          return Promise.reject({
            code: detail.code,
            message: detail.message || "Invalid input",
            help: detail.help || "Please check your input values",
            details: detail.details || "",
          });
        }
        
        if (typeof detail === "string") {
          return Promise.reject({
            code: "ERR_INVALID_INPUT",
            message: detail,
            help: "Please check your input values and ensure they are valid",
          });
        }
      }

      // Handle 500 Server Error
      if (status === 500) {
        const detail = data.detail;
        
        if (typeof detail === "object" && detail.code) {
          return Promise.reject({
            code: detail.code,
            message: detail.message || "Server error",
            help: detail.help || "Please try again later or contact support",
            details: detail.details || "",
          });
        }
        
        if (typeof detail === "string") {
          return Promise.reject({
            code: "ERR_SERVER",
            message: detail,
            help: "Please try again later or contact support",
          });
        }
      }

      // Handle other status codes
      return Promise.reject({
        code: `ERR_HTTP_${status}`,
        message: data.detail || `Request failed with status code ${status}`,
        help: status >= 500 ? "Server error. Please try again later" : "Please check your input and try again",
      });
    }

    // Handle network errors (no response from server)
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        code: "ERR_TIMEOUT",
        message: "Request timed out",
        help: "The server took too long to respond. Please try again",
      });
    }

    // Generic network error
    return Promise.reject({
      code: "ERR_NETWORK",
      message: error.message || "Network error",
      help: "Please check your internet connection and try again",
    });
  }
);

export const calculatorAPI = {
  calculateGrowth: async (request: GrowthRequest): Promise<GrowthResponse> => {
    try {
      const response = await api.post<GrowthResponse>("/calculate/growth", request);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  calculateWithdrawal: async (
    request: WithdrawalRequest
  ): Promise<WithdrawalResponse> => {
    try {
      const response = await api.post<WithdrawalResponse>(
        "/calculate/withdrawal",
        request
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  calculateTimeToTarget: async (
    request: TimeToTargetRequest
  ): Promise<TimeToTargetResponse> => {
    try {
      const response = await api.post<TimeToTargetResponse>(
        "/calculate/time-to-target",
        request
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default api;

// Error types for API error handling

export interface ApiError {
  message: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }> | {
    field: string;
    message: string;
  };
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      details?: unknown;
    };
  };
}

export interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      details?: unknown;
    };
  };
  message?: string;
}


// src/app/core/models/api-response.model.ts
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}


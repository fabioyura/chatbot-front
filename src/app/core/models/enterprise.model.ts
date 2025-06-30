// src/app/core/models/enterprise.model.ts
export interface Enterprise {
    id: string;
    name?: string;
    customPrompt?: string;
  }
  
  export interface CustomPromptResponse {
    customPrompt: string;
  }
  
  export interface UpdatePromptRequest {
    customPrompt: string;
  }

  export interface QrCodeResponse {
  enterpriseId: string;
  enterpriseName: string;
  qrCodeBase64: string;
  generatedAt: Date;
  connected:  boolean;
}

export interface QrCodeBytesResponse {
  value: string;
}
// src/environments/environment.ts
export const environment = {
    production: false,
    apiBaseUrl: 'https://localhost:5282/api',
    endpoints: {
      enterprise: {
        getCustomPrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/custom-prompt`,
        updatePrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/prompt`
      }
    }
  };
  

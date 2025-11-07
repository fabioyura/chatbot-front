// src/environments/environment.ts
export const environment = {
    production: false,
    apiBaseUrl: 'https://construflow-api.azurewebsites.net/api',
    endpoints: {
      enterprise: {
        getCustomPrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/custom-prompt`,
        updatePrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/prompt`
      }
    }
  };
  

  // src/environments/environment.prod.ts
  export const environment = {
    production: true,
    apiBaseUrl: 'https://your-production-api.com/api',
    endpoints: {
      enterprise: {
        getCustomPrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/custom-prompt`,
        updatePrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/prompt`
      }
    }
  };
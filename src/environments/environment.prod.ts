  // src/environments/environment.prod.ts
  export const environment = {
    production: true,
    apiBaseUrl: 'https://chatforge-ergfcverezftd3fb.brazilsouth-01.azurewebsites.net/api',
    endpoints: {
      enterprise: {
        getCustomPrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/custom-prompt`,
        updatePrompt: (enterpriseId: string) => `/Enterprise/${enterpriseId}/prompt`
      }
    }
  };
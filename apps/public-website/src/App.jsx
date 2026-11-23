import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@shared/contexts/LanguageContext';
import { CMSProvider } from '@shared/contexts/CMSContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <CMSProvider>
            <AppRoutes />
          </CMSProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;

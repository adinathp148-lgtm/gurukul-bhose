import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CMSProvider } from './contexts/CMSContext';
import { CRMProvider } from './contexts/CRMContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <CMSProvider>
              <CRMProvider>
                <AppRoutes />
              </CRMProvider>
            </CMSProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;


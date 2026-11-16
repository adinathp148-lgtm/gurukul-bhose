import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from '@shared/contexts/LanguageContext';
import { AuthProvider } from '@shared/contexts/AuthContext';
import { CMSProvider } from '@shared/contexts/CMSContext';
import { CRMProvider } from '@shared/contexts/CRMContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const basename = window.location.pathname.startsWith('/telecaller') ? '/telecaller' : '';

  return (
    <HelmetProvider>
      <BrowserRouter basename={basename}>
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

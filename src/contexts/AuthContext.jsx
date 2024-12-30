import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      const decoded = JSON.parse(atob(response.credential.split('.')[1]));
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          document.body.appendChild(script);
        });

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false // Disable FedCM
        });

      } catch (error) {
        console.error('Error initializing Google Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const signIn = () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false // Disable FedCM
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('Prompt not displayed:', notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log('Prompt skipped:', notification.getSkippedReason());
          }
        });
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
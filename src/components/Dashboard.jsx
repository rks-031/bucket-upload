import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { signIn } = useAuth();

  return (
    <div className="dashboard-container">
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <Card className="border-0" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body className="p-5" style={{ 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}>
            <div className="text-center mb-5">
              <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: '#000' }}>Welcome</h1>
              <p className="text-secondary mb-0">Sign in to manage your files and documents</p>
            </div>
            
            <div className="d-grid gap-3">
              <Button 
                variant="light" 
                size="lg" 
                onClick={signIn}
                className="d-flex align-items-center justify-content-center gap-2 py-3 fw-medium"
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;
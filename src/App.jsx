import React from 'react';
import { Container } from 'react-bootstrap';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Dashboard from './components/Dashboard';
import NavbarComponent from './components/NavbarComponent';
import { useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#fef8fc' }}>
      <NavbarComponent user={user} signOut={signOut} />

      <Container className="py-4">
        {user ? (
          <>
            <FileUpload />
            <FileList />
          </>
        ) : (
          <Dashboard />
        )}
      </Container>
    </div>
  );
}

export default App;
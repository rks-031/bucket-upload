import React from 'react';
import { Container, Button } from 'react-bootstrap';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { user, loading, signIn, signOut } = useAuth();

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
    <div className="app-container d-flex align-items-center justify-content-center p-5">
      <Container className="content-container py-5 text-center">
        <h1 className="mb-5">File Manager</h1>
        {user ? (
          <>
            <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
              <img
                src={user.picture}
                alt={user.name}
                className="rounded-circle"
                style={{ width: '32px', height: '32px' }}
              />
              <span>{user.name}</span>
              <Button variant="outline-danger" onClick={signOut}>
                Sign Out
              </Button>
            </div>
            <FileUpload />
            <FileList />
          </>
        ) : (
          <div>
            <p className="h4 mb-4">Please sign in to manage your files</p>
            <Button variant="primary" size="lg" onClick={signIn}>
              Sign in with Google
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;

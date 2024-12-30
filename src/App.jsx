import React from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
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
    <div className="min-vh-100 bg-light">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>BucketUpload - Aapka Apna File Manager</Navbar.Brand>
          {user && (
            <div className="d-flex align-items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="rounded-circle"
                style={{ width: '32px', height: '32px' }}
              />
              <span className="text-light">{user.name}</span>
              <Button variant="outline-light" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          )}
        </Container>
      </Navbar>

      <Container className="py-4">
        {user ? (
          <>
            <FileUpload />
            <FileList />
          </>
        ) : (
          <div className="text-center">
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
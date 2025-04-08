import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const NavbarComponent = () => {
  const { user, signOut } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand className="text-wrap">BucketUpload - Aapka Apna File Manager</Navbar.Brand>
        {user && (
          <div className="d-flex align-items-center gap-3 user-info">
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
  );
};

export default NavbarComponent;
import React from 'react';
import { Container } from 'react-bootstrap';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-5" > 
    <Container className="py-5 text-center">
      <h1 className="text-center mb-4 ">File Manager</h1>
      <FileUpload />
      <FileList />
    </Container>
    </div>
  );
}

export default App; 
import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { uploadFile } from '../utils/s3Operations';

 export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first!');
      return;
    }

    try {
      setUploading(true);
      await uploadFile(file);
      setMessage('File uploaded successfully!');
      setFile(null);
      e.target.reset();
      // Trigger file list refresh in parent component
      window.dispatchEvent(new Event('fileUploaded'));
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <h3>Upload File</h3>
      <Form onSubmit={handleUpload}>
        <Form.Group className="mb-3">
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            accept="image/*,video/*,.pdf,.doc,.docx"
            disabled={uploading}
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Form>
      {uploading && (
        <ProgressBar animated now={100} className="mt-3" />
      )}
      {message && (
        <Alert className="mt-3" variant={message.includes('success') ? 'success' : 'danger'}>
          {message}
        </Alert>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../utils/s3Operations';

const FileUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const MAX_FILES = 5;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > MAX_FILES) {
      setMessage(`You can only upload a maximum of ${MAX_FILES} files at once.`);
      return;
    }
    
    setFiles(selectedFiles);
    setMessage('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Please select at least one file first!');
      return;
    }

    setUploading(true);
    setMessage('');
    
    try {
      // Initialize progress for each file
      const initialProgress = {};
      files.forEach((file, index) => {
        initialProgress[index] = 0;
      });
      setUploadProgress(initialProgress);
      
      // Upload each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const key = `users/${user.name.replace(/\s+/g, '_')}/files/${Date.now()}-${file.name}`;
        
        // Upload the file and track progress
        await uploadFile(file, key, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [i]: progress
          }));
        });
        
        // Mark as completed
        setUploadProgress(prev => ({
          ...prev,
          [i]: 100
        }));
      }
      
      setMessage('All files uploaded successfully!');
      setFiles([]);
      e.target.reset();
      window.dispatchEvent(new Event('filesUploaded'));
    } catch (error) {
      setMessage('Error uploading files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="mb-4">Upload Files</h3>
      <Form onSubmit={handleUpload}>
        <div className="row">
          <div className="col-sm-12 col-md-8 mb-3">
            <Form.Control
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx,.zip,.tar,.mp3,.mp4"
              disabled={uploading}
              multiple
            />
            <Form.Text className="text-muted">
              Maximum 5 files can be uploaded at once.
            </Form.Text>
          </div>
          <div className="col-sm-12 col-md-4">
            <Button
              type="submit"
              variant="primary"
              disabled={uploading || files.length === 0}
              className="w-100"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Form>
      
      {files.length > 0 && (
        <div className="mt-3">
          <h5>Selected Files ({files.length}/{MAX_FILES}):</h5>
          <ListGroup>
            {files.map((file, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <div className="text-truncate" style={{ maxWidth: '70%' }}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
                {uploading ? (
                  <ProgressBar 
                    now={uploadProgress[index] || 0} 
                    label={`${uploadProgress[index] || 0}%`} 
                    style={{ width: '20%', minWidth: '100px' }} 
                  />
                ) : (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
      
      {message && (
        <Alert
          className="mt-3"
          variant={message.includes('success') ? 'success' : 'danger'}
        >
          {message}
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
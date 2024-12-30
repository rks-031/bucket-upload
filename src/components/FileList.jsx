// src/components/FileList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Modal, Form, Toast } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, getFileUrl, deleteFile, generateShareableLink } from '../utils/s3Operations';
import { sendShareEmail } from '../utils/emailService';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      const prefix = `users/${user.name.replace(/\s+/g, '_')}/files/`;
      const fileList = await listFiles(prefix);
      const filesWithUrls = await Promise.all(
        fileList.map(async (file) => ({
          ...file,
          url: await getFileUrl(file.Key),
          name: file.Key.split('/').pop(),
        }))
      );
      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFiles();
      window.addEventListener('fileUploaded', loadFiles);
      return () => window.removeEventListener('fileUploaded', loadFiles);
    }
  }, [user]);

  const handleDelete = async (fileKey) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileKey);
        await loadFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file. Please try again.');
      }
    }
  };

  const handleShare = async (file) => {
    setSelectedFile(file);
    try {
      const shareableLink = await generateShareableLink(file.Key);
      setShareLink(shareableLink);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Error generating share link. Please try again.');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!shareEmail) {
      alert('Please enter an email address');
      return;
    }

    try {
      setSharing(true);
      await sendShareEmail(
        shareEmail,
        shareLink,
        selectedFile.name,
        user.name
      );
      
      setShowToast(true);
      setToastMessage('Share link sent successfully!');
      setShowShareModal(false);
      setShareEmail('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sharing file:', error);
      setToastMessage('Error sending share link. Please try again.');
      setShowToast(true);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
    } catch (error) {
      console.error('Error copying link:', error);
      setToastMessage('Error copying link. Please try again.');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Uploaded Files</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.Key}>
              <td>{file.name}</td>
              <td>{formatSize(file.Size)}</td>
              <td>{new Date(file.LastModified).toLocaleString()}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Download
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(file.Key)}
                  >
                    Delete
                  </Button>
                  <Button 
                    variant="info" 
                    size="sm"
                    onClick={() => handleShare(file)}
                  >
                    Share
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">No files uploaded yet</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSendEmail}>
            <Form.Group className="mb-3">
              <Form.Label>Share with (email):</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <Form.Label>Share Link:</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  value={shareLink}
                  readOnly
                />
                <Button 
                  variant="outline-primary"
                  onClick={handleCopyLink}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={sharing}>
                {sharing ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default FileList;
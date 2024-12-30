import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Modal, Form, Toast } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, getFileUrl, deleteFile, generateShareableLink } from '../utils/s3Operations';


const FileList = () => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [sending, setSending] = useState(false);

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
      setToastMessage('Error generating share link. Please try again.');
      setShowToast(true);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!shareEmail) {
      setToastMessage('Please enter an email address');
      setShowToast(true);
      return;
    }

    setSending(true);
    try {
      await sendEmail(
        shareEmail,
        shareLink,
        selectedFile.name,
        user.name
      );

      setToastMessage('File shared successfully!');
      setShowToast(true);
      setShowShareModal(false);
      setShareEmail('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sharing file:', error);
      setToastMessage('Failed to share file. Please try again.');
      setShowToast(true);
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setToastMessage('Link copied to clipboard!');
      setShowToast(true);
      setShowShareModal(false);
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
    <div className="table-responsive">
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
                <div className="d-flex gap-2 action-buttons">
                  <Button
                    variant="success"
                    size="sm"
                    className="w-100"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Download
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100"
                    onClick={() => handleDelete(file.Key)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShare(file)}
                    className="w-100"
                    style={{ 
                      backgroundColor: '#FF8C00', 
                      borderColor: '#FF8C00',
                      color: 'white'
                    }}
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
          <div className="mb-3">
            <Form.Label>Share Link:</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={shareLink}
                readOnly
              />
              <Button
                variant="primary"
                onClick={handleCopyLink}
              >
                Copy
              </Button>
            </div>
          </div>
          <div className="text-muted small">
            This link will expire in 3 days.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>
            Close
          </Button>
        </Modal.Footer>
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
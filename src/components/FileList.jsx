import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, getFileUrl, deleteFile } from '../utils/s3Operations';

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
    </div>
  );
};

export default FileList;
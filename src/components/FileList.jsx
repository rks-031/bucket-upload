import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, getFileUrl } from '../utils/s3Operations';

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
      const fileList = await listFiles(`users/${user.id}/files/`);
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.Key}>
              <td>{file.name}</td>
              <td>{formatSize(file.Size)}</td>
              <td>{new Date(file.LastModified).toLocaleString()}</td>
              <td>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  Download
                </Button>
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
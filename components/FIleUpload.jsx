import { useState } from 'react';

export default function FileUpload({ roomId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successUrl, setSuccessUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccessUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessUrl('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId); // Send associated room ID if applicable

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Upload failed');
      } else {
        setSuccessUrl(data.url);
      }
    } catch (err) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf,image/*" />
        <button type="submit" disabled={uploading} style={{ marginTop: 10 }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successUrl && (
        <p style={{ color: 'green' }}>
          File uploaded successfully!{' '}
          <a href={successUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </p>
      )}
    </div>
  );
}

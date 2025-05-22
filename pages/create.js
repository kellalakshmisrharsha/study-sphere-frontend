import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CreateRoomPage() {
  const [creator, setCreator] = useState('');
  const [expiryHours, setExpiryHours] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      if (username) setUser(username);
    }
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    const creatorName = user || creator;
    if (!creatorName) {
      setError('Creator name is required');
      return;
    }
    if (!expiryHours || isNaN(Number(expiryHours)) || Number(expiryHours) <= 0) {
      setError('Please enter a valid expiry time in hours');
      return;
    }
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creatorName, expiryHours, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to create room');
        return;
      }
      localStorage.setItem('username', creatorName);
      router.push(`/room/${data.room.code}`);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24, color: '#2d3748', fontWeight: 700, fontSize: 32 }}>Create a Study Room</h1>
      <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!user && (
          <input
            placeholder="Your Name"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
        )}
        <input
          type="number"
          placeholder="Room Expiry (hours)"
          value={expiryHours}
          onChange={e => setExpiryHours(e.target.value)}
          min="1"
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          required
        />
        <input
          type="password"
          placeholder="Room Password (optional)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 14, borderRadius: 8, background: 'linear-gradient(90deg,#667eea,#5a67d8)', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px #667eea33' }}>
          Create Room
        </button>
      </form>
      {error && <p style={{ color: '#e53e3e', marginTop: 16, textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

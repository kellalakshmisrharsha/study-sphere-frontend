import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function JoinPage() {
  const [username, setUsername] = useState('');
  const [roomcode, setRoomcode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) setUser(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetch('/api/room/list')
      .then(res => res.json())
      .then(data => setRooms(data.rooms || []));
  }, []);

  useEffect(() => {
    if (roomcode.trim().length === 6) {
      fetch(`/api/room/get?code=${roomcode.trim().toUpperCase()}`)
        .then(res => res.json())
        .then(data => setRoomInfo(data.room || null))
        .catch(() => setRoomInfo(null));
    } else {
      setRoomInfo(null);
    }
  }, [roomcode]);

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    const trimmedUsername = (user || username).trim();
    const trimmedRoomcode = roomcode.trim().toUpperCase();
    if (!trimmedUsername || !trimmedRoomcode) {
      setError('Please enter both username and room code');
      return;
    }
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, roomcode: trimmedRoomcode, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to join room');
        return;
      }
      localStorage.setItem('username', trimmedUsername);
      await router.push(`/room/${trimmedRoomcode}`);
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24, color: '#2d3748', fontWeight: 700, fontSize: 32 }}>Join a Study Room</h1>
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {!user && (
          <input
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
          />
        )}
        <input
          placeholder="Room Code"
          value={roomcode}
          onChange={(e) => setRoomcode(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Room Password (if required)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, display: roomInfo && roomInfo.password ? 'block' : 'none' }}
        />
        {roomInfo && roomInfo.password && (
          <div style={{ color: '#e53e3e', fontSize: 14, marginTop: -10, marginBottom: 6 }}>
            <span role="img" aria-label="lock">🔒</span> This room is password protected
          </div>
        )}
        <button type="submit" style={{ padding: 14, borderRadius: 8, background: 'linear-gradient(90deg,#48bb78,#38a169)', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px #38a16933' }}>
          Join Room
        </button>
      </form>
      {error && <p style={{ color: '#e53e3e', marginTop: 16, textAlign: 'center' }}>{error}</p>}
      {rooms.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ color: '#4a5568', fontWeight: 600, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Available Rooms</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            justifyContent: 'center',
          }}>
            {rooms.map(room => (
              <div
                key={room.code}
                onClick={() => setRoomcode(room.code)}
                style={{
                  background: '#f7fafc',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px #667eea22',
                  padding: '18px 18px 14px 18px',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  border: '2px solid transparent',
                  position: 'relative',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 6px 24px #667eea33';
                  e.currentTarget.style.border = '2px solid #667eea';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 2px 12px #667eea22';
                  e.currentTarget.style.border = '2px solid transparent';
                }}
              >
                <div style={{ fontWeight: 700, color: '#5a67d8', fontSize: 20, marginBottom: 6 }}>{room.name || 'Room'} ({room.code})</div>
                <div style={{ color: '#444', fontSize: 15, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>Creator:</span> {room.creator || 'N/A'}
                </div>
                <div style={{ color: '#718096', fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>Expires:</span> {room.expiresAt ? new Date(room.expiresAt).toLocaleString() : 'N/A'}
                </div>
                <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 13, color: '#667eea', fontWeight: 600 }}>Click to select</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

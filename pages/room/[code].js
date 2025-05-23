import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { SASProtocol } from '@azure/storage-blob';
import CryptoJS from 'crypto-js';

let socket;

// Helper: get encryption key from password (simple, for demo)
function getRoomKey(password) {
  // You can use a hash for key derivation
  return CryptoJS.SHA256(password).toString();
}

// Encrypt message content
function encryptMessage(content, key) {
  return CryptoJS.AES.encrypt(content, key).toString();
}

// Decrypt message content
function decryptMessage(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '[Decryption failed]';
  }
}

export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [expiryHours, setExpiryHours] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // No user info, redirect to login
      router.replace('/login');
    }
  }, []);

  useEffect(() => {
    if (!code || !username) return;

    // Initialize socket connection once
    if (!socket) {
      socket = io("https://study-sphere-backend-lp6v.onrender.com");
    }

    // Fetch room data
    axios.get(`/api/room/get?code=${code}`)
      .then(res => {
        setRoom(res.data.room);
        // Build share URL
        const base = window.location.origin;
        setShareUrl(`${base}/room/${code}`);
        setLoading(false);
        // If password is set and user is not a member, show join prompt
        if (res.data.room.password && (!res.data.room.members || !res.data.room.members.includes(username))) {
          setShowJoinPrompt(true);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch old messages
    axios.get(`https://study-sphere-backend-lp6v.onrender.com/api/messages?roomId=${code}`)
      .then(res => {
        // Separate messages and files
        const msgs = res.data.messages.filter(m => m.type !== 'file');
        const fls = res.data.messages.filter(m => m.type === 'file');
        setMessages(msgs);
        setFiles(fls);
      })
      .catch(err => {
        console.error('Failed to fetch messages:', err);
      });

    // Join socket room
    socket.emit('join-room', code);

    // Listen for incoming messages
    socket.on('receive-message', (message) => {
      if (message.type === 'file') {
        setFiles((prev) => [...prev, message]);
      } else {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('receive-message');
      // socket.disconnect(); // Optional disconnect on unmount
    };
  }, [code, username]);

  // Decrypt messages before rendering
  const decryptedMessages = messages.map(msg => {
    if (msg.encrypted) {
      // Try to decrypt with the correct password if available
      let key = '';
      if (room && (joinPassword || room.password)) {
        key = getRoomKey(joinPassword || room.password);
      }
      let decrypted = '';
      try {
        decrypted = decryptMessage(msg.content, key);
      } catch {
        decrypted = '';
      }
      // If decryption fails or is empty, show a warning instead of empty
      if (!decrypted || decrypted === '[Decryption failed]') {
        decrypted = '[Encrypted message: cannot decrypt]';
      }
      return { ...msg, content: decrypted };
    }
    return msg;
  }).filter(msg => msg.content && msg.content.trim() !== '');

  // Send text message
  const sendMessage = () => {
    if (!input.trim() || !username.trim()) return;
    // Only encrypt if password is actually provided (not just room.password exists)
    let key = null;
    if (room.password && (joinPassword || room.password)) {
      key = getRoomKey(joinPassword || room.password);
    }
    let encryptedContent = input.trim();
    let encrypted = false;
    if (key) {
      encryptedContent = encryptMessage(input.trim(), key);
      encrypted = true;
    }
    const message = {
      sender: username,
      type: 'text',
      content: encryptedContent,
      encrypted,
      roomId: code,
      timestamp: new Date().toISOString(),
    };
    socket.emit('send-message', { roomId: code, message });
    setInput('');
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', code);
      formData.append('sender', username);
      formData.append('expiryHours', expiryHours);

      // Encrypt file name (not file data) if password is set
      let encryptedFileName = file.name;
      let encrypted = false;
      if (room.password || joinPassword) {
        const key = getRoomKey(joinPassword || room.password);
        encryptedFileName = encryptMessage(file.name, key);
        encrypted = true;
      }

      // Upload to your API endpoint that handles file uploads
      const res = await axios.post(`https://study-sphere-backend-lp6v.onrender.com/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { fileUrl, fileType, fileName, expiresAt } = res.data;

      // Emit file message
      const message = {
        sender: username,
        type: 'file',
        fileUrl,
        fileType,
        fileName: encryptedFileName,
        expiresAt, // include expiry in the message
        roomId: code,
        timestamp: new Date().toISOString(),
        encrypted,
      };

      socket.emit('send-message', { roomId: code, message });
      // Do NOT update setFiles here; let the socket event handle it
    } catch (err) {
      console.error('File upload failed:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
      fileInputRef.current.value = null; // Reset file input
    }
  };

  if (showJoinPrompt) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#5a67d8', fontWeight: 700, fontSize: 26, marginBottom: 18 }}>Enter Room Password</h2>
        <input
          type="password"
          placeholder="Room Password"
          value={joinPassword}
          onChange={e => setJoinPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, marginBottom: 16, width: '100%' }}
        />
        <button
          onClick={async () => {
            setJoinError('');
            try {
              const res = await fetch('/api/room/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, roomcode: code, password: joinPassword }),
              });
              const data = await res.json();
              if (!res.ok) {
                setJoinError(data.message || 'Failed to join room');
                return;
              }
              setShowJoinPrompt(false);
              setRoom(r => ({ ...r, members: [...(r.members || []), username] }));
            } catch (err) {
              setJoinError('Network error');
            }
          }}
          style={{ padding: 14, borderRadius: 8, background: 'linear-gradient(90deg,#667eea,#5a67d8)', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px #667eea33', width: '100%' }}
        >
          Join Room
        </button>
        {joinError && <p style={{ color: '#e53e3e', marginTop: 16, textAlign: 'center' }}>{joinError}</p>}
      </div>
    );
  }

  if (!username) return <p>Redirecting to login...</p>;
  if (loading) return <p>Loading...</p>;
  if (!room) return <p>Room not found.</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 36, background: '#fff', borderRadius: 22, boxShadow: '0 8px 36px #667eea22', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: '#5a67d8', fontWeight: 900, fontSize: 36, margin: 0, letterSpacing: 1 }}>Room: <span style={{ color: '#2d3748' }}>{room.code}</span></h1>
          <div style={{ color: '#444', fontWeight: 600, fontSize: 20, marginTop: 6 }}>Created By: {room.creator}</div>
          {room.expiresAt && (
            <div style={{ color: '#718096', fontSize: 16, marginTop: 2 }}>Expires At: {new Date(room.expiresAt).toLocaleString()}</div>
          )}
        </div>
        <div style={{ minWidth: 340, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 16, background: '#f7fafc', fontWeight: 500, color: '#2d3748', transition: 'box-shadow 0.2s', boxShadow: copied ? '0 0 0 2px #48bb7855' : 'none' }}
            onFocus={e => e.target.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            style={{ padding: '10px 22px', borderRadius: 8, background: copied ? '#48bb78' : 'linear-gradient(90deg,#667eea,#5a67d8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: copied ? '0 2px 8px #48bb7833' : '0 2px 8px #667eea33', fontSize: 16, transition: 'background 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
            aria-label="Copy room link"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <rect x="6" y="6" width="10" height="10" rx="3" fill="#fff" stroke="#5a67d8" strokeWidth="2"/>
              <rect x="2" y="2" width="10" height="10" rx="3" fill="#fff" stroke="#5a67d8" strokeWidth="2"/>
            </svg>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Chat Section */}
        <div style={{ flex: 1.3, minWidth: 340, background: '#f7fafc', borderRadius: 14, boxShadow: '0 2px 12px #667eea11', padding: 20, marginBottom: 24 }}>
          <h2 style={{ color: '#2d3748', fontWeight: 800, fontSize: 24, marginBottom: 14, letterSpacing: 0.5 }}>💬 Chat</h2>
          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: 10, padding: 14, height: 240, overflowY: 'auto', marginBottom: 14, background: '#fff' }}>
            {decryptedMessages.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 60 }}>No messages yet. Start the conversation!</div>
            ) : decryptedMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: msg.sender === username ? '#e6fffa' : '#edf2f7', alignSelf: msg.sender === username ? 'flex-end' : 'flex-start', boxShadow: msg.sender === username ? '0 2px 8px #38a16922' : 'none' }}>
                <strong style={{ color: '#5a67d8' }}>{msg.sender}:</strong> <span style={{ color: '#2d3748' }}>{msg.content}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 16, background: '#fff' }}
              disabled={uploading}
            />
            <button onClick={sendMessage} disabled={uploading || !input.trim()} style={{ padding: '12px 22px', borderRadius: 8, background: 'linear-gradient(90deg,#48bb78,#38a169)', color: '#fff', fontWeight: 800, border: 'none', cursor: uploading || !input.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #38a16933', fontSize: 16 }}>
              Send
            </button>
          </div>
        </div>
        {/* Files Section */}
        <div style={{ flex: 1, minWidth: 280, background: '#f7fafc', borderRadius: 14, boxShadow: '0 2px 12px #667eea11', padding: 20, marginBottom: 24 }}>
          <h2 style={{ color: '#2d3748', fontWeight: 800, fontSize: 24, marginBottom: 14, letterSpacing: 0.5 }}>📁 Files</h2>
          <div style={{ border: '1.5px solid #cbd5e1', borderRadius: 10, padding: 14, height: 240, overflowY: 'auto', marginBottom: 14, background: '#fff' }}>
            {files.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: 60 }}>No files uploaded yet.</div>
            ) : files.map((msg, i) => {
              const isImage = msg.fileType?.startsWith('image/');
              let displayFileName = msg.fileName;
              if (msg.encrypted && (room.password || joinPassword)) {
                const key = getRoomKey(joinPassword || room.password);
                displayFileName = decryptMessage(msg.fileName, key);
              }
              return (
                <div key={i} style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: '#edf2f7', boxShadow: '0 1px 4px #667eea11' }}>
                  <strong style={{ color: '#5a67d8' }}>{msg.sender} sent a file:</strong>
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#333' }}>{displayFileName}</span>
                    {isImage ? (
                      <img
                        src={msg.fileUrl}
                        alt={displayFileName}
                        style={{ maxWidth: '120px', borderRadius: '8px', display: 'block', marginTop: 4, boxShadow: '0 2px 8px #667eea22' }}
                      />
                    ) : (
                      <button onClick={() => {
                        // Remove any existing iframe/closeBtn
                        const oldIframe = document.getElementById('file-view-iframe');
                        const oldBtn = document.getElementById('file-view-close-btn');
                        if (oldIframe) document.body.removeChild(oldIframe);
                        if (oldBtn) document.body.removeChild(oldBtn);
                        // Create new iframe
                        const iframe = document.createElement('iframe');
                        iframe.src = msg.fileUrl;
                        iframe.style.width = '80vw';
                        iframe.style.height = '80vh';
                        iframe.style.position = 'fixed';
                        iframe.style.top = '10vh';
                        iframe.style.left = '10vw';
                        iframe.style.background = '#fff';
                        iframe.style.zIndex = 1000;
                        iframe.style.border = '2px solid #333';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.id = 'file-view-iframe';
                        // Add a close button
                        const closeBtn = document.createElement('button');
                        closeBtn.innerText = 'Close';
                        closeBtn.style.position = 'fixed';
                        closeBtn.style.top = '12vh';
                        closeBtn.style.left = 'calc(90vw - 60px)';
                        closeBtn.style.zIndex = 1001;
                        closeBtn.id = 'file-view-close-btn';
                        closeBtn.onclick = () => {
                          document.body.removeChild(iframe);
                          document.body.removeChild(closeBtn);
                        };
                        document.body.appendChild(iframe);
                        document.body.appendChild(closeBtn);
                      }} style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 6, background: '#667eea', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 4px #667eea22' }}>
                        View File
                      </button>
                    )}
                  </div>
                  {msg.expiresAt && (
                    <div style={{ fontSize: '0.9em', color: '#888', marginTop: 2 }}>
                      Expires: {msg.expiresAt ? new Date(msg.expiresAt).toLocaleString() : 'N/A'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Expiry (hours)"
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              min="1"
              required
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 16, background: '#fff' }}
            />
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
              style={{ flex: 2, padding: 10, borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#f7fafc' }}
            />
          </div>
          {uploading && <p style={{ color: '#e53e3e', marginTop: 10, fontWeight: 600 }}>Uploading file...</p>}
        </div>
        {/* Members Section */}
        <div style={{ flex: 0.7, minWidth: 180, background: '#f7fafc', borderRadius: 14, boxShadow: '0 2px 12px #667eea11', padding: 20, marginBottom: 24 }}>
          <h2 style={{ color: '#2d3748', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>👥 Members</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {room.members.map((m, i) => (
              <li key={i} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', marginBottom: 10, color: '#444', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 4px #667eea11', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#667eea', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{m[0]?.toUpperCase() || '?'}</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

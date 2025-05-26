"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NavBar = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      const photoURL = localStorage.getItem('photoURL');
      setUser(username ? { username, photoURL } : null);
    }
  }, []);

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', background: 'linear-gradient(90deg,#667eea,#5a67d8)',
      boxShadow: '0 2px 8px #667eea33', marginBottom: 32, borderRadius: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <Link href="/" style={{ color: '#fff', fontWeight: 700, fontSize: 24, textDecoration: 'none', letterSpacing: 1 }}>StudySphere</Link>
        <Link href="/join" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none' }}>Join Room</Link>
        <Link href="/create" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none' }}>Create Room</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 18 }}>
            {user.photoURL && <img src={user.photoURL} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 8, border: '2px solid #fff' }} />}
            <span>{user.username}</span>
          </Link>
        ) : (
          <Link href="/login" style={{ color: '#fff', fontWeight: 500, fontSize: 18, textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

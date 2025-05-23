"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqRSpMQjBpD0eMHJEIuJBwPwd1mltktaE",
  authDomain: "study-sphere-3739b.firebaseapp.com",
  projectId: "study-sphere-3739b",
  storageBucket: "study-sphere-3739b.appspot.com",
  messagingSenderId: "441672302392",
  appId: "1:441672302392:web:d09325d6ba7afc8bb64bcd",
  measurementId: "G-1CL78HDGM8"
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('username'));
      // If already logged in, redirect to home
      if (localStorage.getItem('username')) {
        router.replace('/');
      }
    }
  }, [router]);

  if (!mounted) return null;

  const handleGoogleLogin = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('username', user.displayName || '');
      localStorage.setItem('email', user.email || '');
      localStorage.setItem('photoURL', user.photoURL || '');
      setIsLoggedIn(true);
      setTimeout(() => router.replace('/'), 200);
    } catch (error) {
      if (error instanceof Error) {
        alert('Login failed: ' + error.message);
      } else {
        alert('Login failed: ' + String(error));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('photoURL');
    setIsLoggedIn(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, color: '#2d3748', marginBottom: 24 }}>Sign in to StudySphere</h2>
      {isLoggedIn ? (
        <>
          <p style={{ color: '#38a169', fontWeight: 500, fontSize: 18 }}>You are already logged in.</p>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1.5rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: 8, background: 'linear-gradient(90deg,#f56565,#ed8936)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #ed893633', transition: 'background 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M7 10h6m0 0l-2-2m2 2l-2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="3" width="14" height="14" rx="4" stroke="#fff" strokeWidth="2"/>
            </svg>
            Log out
          </button>
        </>
      ) : (
        <button onClick={handleGoogleLogin} style={{ padding: '0.5rem 1.5rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: 8, background: 'linear-gradient(90deg,#667eea,#5a67d8)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px #667eea33', transition: 'background 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <g>
              <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.1 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.6-6.6C34.5 6.5 29.5 4 24 4 15.6 4 8.1 9.6 6.3 14.7z"/>
              <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.6 0 5 .9 6.9 2.4l6.6-6.6C34.5 6.5 29.5 4 24 4 15.6 4 8.1 9.6 6.3 14.7z"/>
              <path fill="#FBBC05" d="M24 44c5.3 0 10.2-1.8 13.9-4.9l-6.4-5.2C29.5 35.7 26.9 37 24 37c-5.3 0-9.8-3.6-11.4-8.5l-6.6 5.1C8.1 38.4 15.6 44 24 44z"/>
              <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-4.2 7-11.3 7-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.6-6.6C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.5z"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      )}
    </div>
  );
}

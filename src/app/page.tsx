"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Define a type for user info
interface UserInfo {
  username: string;
  email: string;
  photoURL: string;
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");
      const photoURL = localStorage.getItem("photoURL");
      if (username) {
        setUser({ username, email: email || "", photoURL: photoURL || "" });
      }
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <main style={{ maxWidth: 700, margin: 'auto', padding: 32 }}>
        <h1 style={{ fontWeight: 700, fontSize: 40, color: '#2d3748', marginBottom: 8 }}>Welcome to <span style={{ color: '#5a67d8' }}>StudySphere</span></h1>
        <p style={{ fontSize: 20, color: '#4a5568', marginBottom: 24 }}>Your collaborative study and chat platform.</p>
        {user ? (
          <div style={{ margin: "1rem 0", display: "flex", alignItems: "center", gap: "1rem", background: '#f7fafc', padding: 16, borderRadius: 12, minHeight: 60, boxShadow: '0 1px 6px #5a67d822' }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="User avatar" style={{ width: 48, height: 48, borderRadius: "50%", border: '2px solid #5a67d8', background: '#fff' }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, color: '#2d3748', fontWeight: 600 }}>Logged in as <b>{user.username}</b></span>
              <span style={{ color: "#888", fontSize: "0.95em", marginTop: 2 }}>{user.email}</span>
            </div>
          </div>
        ) : (
          <div style={{ margin: "1rem 0", background: '#f7fafc', padding: 16, borderRadius: 12 }}>
            <span style={{ color: "#888" }}>You are not logged in.</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1.5rem', margin: '2rem 0', justifyContent: 'center' }}>
          <Link href="/join" style={{ padding: '12px 32px', borderRadius: 8, background: 'linear-gradient(90deg,#667eea,#5a67d8)', color: '#fff', fontWeight: 600, fontSize: 18, textDecoration: 'none', boxShadow: '0 2px 8px #667eea33', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s, box-shadow 0.2s' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="#5a67d8"/>
              <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Join Room
          </Link>
          <Link href="/create" style={{ padding: '12px 32px', borderRadius: 8, background: 'linear-gradient(90deg,#48bb78,#38a169)', color: '#fff', fontWeight: 600, fontSize: 18, textDecoration: 'none', boxShadow: '0 2px 8px #38a16933', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s, box-shadow 0.2s' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#38a169" stroke="#fff" strokeWidth="2"/>
              <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Room
          </Link>
          <Link href="/login" style={{ padding: '12px 32px', borderRadius: 8, background: '#fff', color: '#5a67d8', fontWeight: 600, fontSize: 18, border: '2px solid #5a67d8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s, box-shadow 0.2s' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <circle cx="10" cy="10" r="9" stroke="#5a67d8" strokeWidth="2" fill="#fff"/>
              <path d="M10 6v4l2.5 2.5" stroke="#5a67d8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {user ? "Switch Account" : "Login"}
          </Link>
        </div>
        <ol style={{ fontSize: 17, color: '#4a5568', background: '#f7fafc', borderRadius: 12, padding: 20, marginTop: 24 }}>
          <li style={{ marginBottom: 8 }}>Join or create a study room to chat and share files in real time.</li>
          <li>Sign in with Google to access all features.</li>
        </ol>
      </main>
    </div>
  );
}

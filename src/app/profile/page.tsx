"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<{ username: string; photoURL?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username");
      const photoURL = localStorage.getItem("photoURL");
      if (!username) {
        router.replace("/login");
      } else {
        setUser({ username, photoURL: photoURL || undefined });
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("photoURL");
    router.replace("/login");
  };

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: 80 }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 32, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #0001", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {user.photoURL && (
        <img src={user.photoURL} alt="Profile" style={{ width: 90, height: 90, borderRadius: "50%", marginBottom: 18, objectFit: "cover", boxShadow: "0 2px 8px #667eea33" }} />
      )}
      <h2 style={{ color: "#5a67d8", fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Profile</h2>
      <div style={{ color: "#2d3748", fontWeight: 600, fontSize: 20, marginBottom: 18 }}>{user.username}</div>
      <button onClick={handleLogout} style={{ padding: 12, borderRadius: 8, background: "linear-gradient(90deg,#667eea,#5a67d8)", color: "#fff", fontWeight: 600, fontSize: 18, border: "none", marginTop: 8, cursor: "pointer", boxShadow: "0 2px 8px #667eea33", width: "100%" }}>
        Logout
      </button>
    </div>
  );
}

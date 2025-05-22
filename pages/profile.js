import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username");
      const photoURL = localStorage.getItem("photoURL");
      if (!username) {
        router.replace("/login");
      } else {
        setUser({ username, photoURL });
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("photoURL");
    router.replace("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(90deg,#667eea,#5a67d8)",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px #667eea22",
        padding: "2.5rem 2.5rem 2rem 2.5rem",
        minWidth: 340,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid #667eea", marginBottom: 8 }}
          />
        )}
        <h2 style={{ margin: 0, color: "#5a67d8", fontWeight: 700, fontSize: 28 }}>Profile</h2>
        <div style={{ color: "#444", fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
          {user.username}
        </div>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 16,
            background: "#667eea",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.7rem 2.2rem",
            fontWeight: 600,
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 2px 8px #667eea33",
            transition: "background 0.2s",
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

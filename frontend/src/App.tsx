import "./index.css";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { request } from "./api/client";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function wakeServer() {
      try {
        await request<string>("", {}, "text");
      } catch (err) {
        console.error("API error:", err);
        setError("Unable to reach API.");
      } finally {
        setLoading(false);
      }
    }

    wakeServer();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="app">
        <h1>Hyprdeck</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Hyprdeck</h1>
      <p>Welcome!</p>
      <div className="content">
        <p>Content</p>
      </div>
    </div>
  );
}
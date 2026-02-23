import { useEffect, useState } from "react";
import { request } from "./api/client";

export default function App() {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    request<string>("", {}, "text")
      .then((res) => setMessage(res as string))
      .catch((err) => {
        console.error(err);
        setMessage("API error");
      });
  }, []);

  return (
    <div>
      <h1>Hyprdeck</h1>
      <p>{message}</p>
    </div>
  );
}
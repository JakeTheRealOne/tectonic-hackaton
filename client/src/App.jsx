import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load message");
        }
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setError("Could not reach the API");
        setMessage("");
      });
  }, []);

  return (
    <main className="page">
      <h1>{error || message}</h1>
      <p className="stack">MongoDB · Express · React · Node</p>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-label">{isUser ? "You" : "Tectonic"}</div>
      {message.text ? <p className="message-text">{message.text}</p> : null}
      {message.files?.length > 0 ? (
        <ul className="message-files">
          {message.files.map((file) => (
            <li key={`${file.originalName}-${file.size}`}>
              <span className="file-name">{file.originalName}</span>
              <span className="file-meta">{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load messages");
        return response.json();
      })
      .then((data) => setMessages(data.messages || []))
      .catch((err) => {
        console.error(err);
        setError("Could not reach the API");
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);

  async function handleNewChat() {
    setError("");
    try {
      const response = await fetch("/api/messages", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear chat");
      setMessages([]);
      setText("");
      setFiles([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
      setError("Could not start a new chat");
    }
  }

  function handleFilesSelected(event) {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    event.target.value = "";
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSend(event) {
    event.preventDefault();
    if (sending) return;

    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    setSending(true);
    setError("");

    const formData = new FormData();
    formData.append("text", trimmed);
    files.forEach((file) => formData.append("files", file));

    const optimisticUser = {
      _id: `local-user-${Date.now()}`,
      role: "user",
      text: trimmed,
      files: files.map((file) => ({
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      })),
    };

    setMessages((prev) => [...prev, optimisticUser]);
    setText("");
    setFiles([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((msg) => msg._id !== optimisticUser._id);
        return [...withoutOptimistic, data.userMessage, data.assistantMessage];
      });
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticUser._id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  const canSend = (text.trim().length > 0 || files.length > 0) && !sending;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">Tectonic</div>
        <button type="button" className="new-chat-btn" onClick={handleNewChat}>
          New chat
        </button>
        <p className="sidebar-note">Chat-style MERN demo with placeholder replies.</p>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="chat-pane">
        <header className="chat-header">
          <button
            type="button"
            className="menu-btn"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <span className="header-title">Tectonic</span>
        </header>

        <main className="chat-main">
          {messages.length === 0 ? (
            <section className="empty-state">
              <h1>Tectonic</h1>
              <p>Ask anything. Attach a file if you like. Replies are placeholder lorem ipsum.</p>
            </section>
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <MessageBubble key={message._id} message={message} />
              ))}
              {sending ? (
                <article className="message message-assistant pending">
                  <div className="message-label">Tectonic</div>
                  <p className="message-text thinking">Thinking…</p>
                </article>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        <footer className="composer-wrap">
          {error ? <p className="error-banner">{error}</p> : null}

          {files.length > 0 ? (
            <ul className="pending-files">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <form className="composer" onSubmit={handleSend}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="file-input"
              onChange={handleFilesSelected}
            />
            <button
              type="button"
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
            >
              Attach
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (canSend) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              placeholder="Message Tectonic…"
              aria-label="Message"
            />
            <button type="submit" className="send-btn" disabled={!canSend}>
              Send
            </button>
          </form>
          <p className="composer-hint">Enter to send · Shift+Enter for a new line</p>
        </footer>
      </div>
    </div>
  );
}

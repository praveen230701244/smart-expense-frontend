import { useEffect, useMemo, useRef, useState } from "react";
import { apiChat } from "../services/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Upload some expenses (CSV/PDF) or add manual entries, and ask me questions like:\n\n- Where am I wasting money?\n- How can I save more?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const canSend = input.trim().length > 0 && !loading;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const message = input.trim();
    if (!message) return;

    setError("");
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const data = await apiChat(message);
      const advice = data?.advice || "No advice returned.";
      setMessages((prev) => [...prev, { role: "assistant", content: advice }]);
    } catch (e) {
      setError(e?.message || "Chat request failed.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry—I couldn’t generate advice right now. Try uploading expenses first, then ask again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const placeholder = useMemo(() => {
    return "Ask about overspending, savings, or budget ideas...";
  }, []);

  return (
    <div className="mainContentInner">
      <h1>Chatbot</h1>
      {error ? <div className="errorBox">{error}</div> : null}

      <div className="chatShell">
        <div className="chatList" ref={listRef}>
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={`bubbleRow ${m.role === "user" ? "bubbleUser" : "bubbleAssistant"}`}
            >
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading ? (
            <div className="bubbleRow bubbleAssistant">
              <div className="bubble">Analyzing your expenses...</div>
            </div>
          ) : null}
        </div>

        <div>
          <div
            className="card"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="chatInputRow">
              <input
                type="text"
                value={input}
                placeholder={placeholder}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button className="btn" onClick={send} disabled={!canSend}>
                Send
              </button>
            </div>
            <div className="muted" style={{ marginTop: 10, fontWeight: 800, fontSize: 12 }}>
              Example: "Where am I wasting money?"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


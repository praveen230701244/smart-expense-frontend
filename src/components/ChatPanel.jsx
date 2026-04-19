import { useEffect, useMemo, useRef, useState } from "react";
import { apiChat } from "../services/api";

const SUGGESTIONS = ["Where am I overspending?", "How to save money?", "Show risky expenses"];

export default function ChatPanel({ compact = false }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about overspending, savings, and risky expenses. I’ll respond with ₹ amounts, % shares, and one clear next step.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const typingTimerRef = useRef(null);

  const canSend = input.trim().length > 0 && !loading;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  const addAssistantTyping = (fullText, source) => {
    const text = String(fullText || "").trim() || "I’m having trouble analyzing right now, try again.";
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setMessages((prev) => [...prev, { id, role: "assistant", content: "", typing: true, source }]);

    let i = 0;
    const speedMs = 14;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      i += Math.max(1, Math.floor(text.length / 220));
      const chunk = text.slice(0, i);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: chunk, source } : m))
      );
      if (i >= text.length) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, typing: false, source } : m))
        );
      }
    }, speedMs);
  };

  const send = async (overrideText) => {
    const message = String(overrideText ?? input).trim();
    if (!message) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const data = await apiChat(message);
      addAssistantTyping(data?.advice || "", data?.source);
    } catch (e) {
      setError(e?.message || "Chat request failed.");
      addAssistantTyping("I’m having trouble analyzing right now, try again.", "fallback");
    } finally {
      setLoading(false);
    }
  };

  const placeholder = useMemo(() => "Ask: “What should I cut this month?”", []);

  return (
    <div className={compact ? "" : "mainContentInner"}>
      {!compact ? (
        <div className="chatHeader">
          <div className="chatTitle">🤖 AI Advisor</div>
          <div className="chatSubtitle">Short, specific, actionable answers with ₹ and %.</div>
        </div>
      ) : null}

      {error ? <div className="errorBox">{error}</div> : null}

      <div className="chatShell">
        <div className="chatList" ref={listRef}>
          <div className="chatSuggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>

          {messages.map((m, idx) => (
            <div
              key={m.id || `${m.role}-${idx}`}
              className={`bubbleRow ${m.role === "user" ? "bubbleUser" : "bubbleAssistant"}`}
            >
              <div className="bubble">
                {m.role === "assistant" && m.source && !m.typing ? (
                  <div className="muted" style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                    {m.source === "gemini" ? "🤖 Powered by Gemini" : "⚠ Basic Insights"}
                  </div>
                ) : null}
                {m.content}
                {m.typing ? <span className="typingCursor">▍</span> : null}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="bubbleRow bubbleAssistant">
              <div className="bubble">
                Thinking <span className="dots">...</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="card">
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
            <button className="btn" onClick={() => send()} disabled={!canSend}>
              Send
            </button>
          </div>
          <div className="muted" style={{ marginTop: 10, fontWeight: 800, fontSize: 12 }}>
            Tip: Ask “Where can I save ₹1000/month?” for a concrete target.
          </div>
        </div>
      </div>
    </div>
  );
}


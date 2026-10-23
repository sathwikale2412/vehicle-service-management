import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

export default function AIAssistant({ vehicles, services, expenses, reminders }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your AI Vehicle Maintenance Assistant. I monitor your fleet health, predict upcoming service requirements, audit expenses, and diagnose automotive issues. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [healthScores, setHealthScores] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-fetch diagnostic insights from API on mount
  useEffect(() => {
    fetchInsights();
  }, [vehicles, services, expenses]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInsights = async () => {
    try {
      const resp = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles, services, expenses }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiInsights(data.insights || []);
        setHealthScores(data.health_scores || {});
      } else {
        generateLocalInsights();
      }
    } catch (err) {
      generateLocalInsights();
    }
  };

  const generateLocalInsights = () => {
    const list = [];
    vehicles.forEach((v) => {
      const km = parseInt(v.odometer_km || 0);
      if (km > 50000) {
        list.push({
          type: 'warning',
          vehicle: v.name,
          title: 'Scheduled Fluid & Belt Inspection',
          detail: `${v.name} is at ${km.toLocaleString()} km. Inspect alternator drive belt and coolant concentration.`,
        });
      }
      if (v.fuel_type?.toLowerCase() === 'diesel') {
        list.push({
          type: 'suggestion',
          vehicle: v.name,
          title: 'Diesel Particle & Injector Care',
          detail: `Run 20-30 minutes at highway speeds monthly to prevent DPF soot clogging.`,
        });
      }
    });
    setAiInsights(list);
  };

  const handleSend = async (textToSend) => {
    const msg = (textToSend || input).trim();
    if (!msg) return;

    const userMsg = { id: `usr-${Date.now()}`, sender: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: { vehiclesCount: vehicles.length, servicesCount: services.length },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages((prev) => [
          ...prev,
          { id: `ast-${Date.now()}`, sender: 'assistant', text: data.reply },
        ]);
      } else {
        fallbackReply(msg);
      }
    } catch (err) {
      fallbackReply(msg);
    } finally {
      setLoading(false);
    }
  };

  const fallbackReply = (q) => {
    const lower = q.toLowerCase();
    let reply = "Regular maintenance is crucial for safety and resale value. Check your vehicle's manual or add a service reminder in VSRMS.";
    if (lower.includes('oil')) {
      reply = "For diesel engines like the Innova Crysta, synthetic oil should be changed every 10,000 km or 12 months with a fresh oil filter.";
    } else if (lower.includes('tyre') || lower.includes('tire')) {
      reply = "Rotate tyres every 8,000 to 10,000 km in a cross-pattern to promote even tread wear and avoid premature replacement.";
    } else if (lower.includes('puc') || lower.includes('insurance')) {
      reply = "PUC certificates must be renewed annually for BS-IV/VI vehicles. Insurance renewal before expiry protects your No Claim Bonus (NCB).";
    }
    setMessages((prev) => [
      ...prev,
      { id: `ast-${Date.now()}`, sender: 'assistant', text: reply },
    ]);
  };

  const promptChips = [
    'When to change oil?',
    'Tyre rotation interval',
    'Diesel mileage tips',
    'PUC & Insurance rules',
  ];

  return (
    <div className="ai-column-card">
      <div className="ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: '#60a5fa' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Vehicle Assistant</span>
        </div>
        <span className="ai-badge">
          <Bot size={12} />
          <span>Active Diagnostic</span>
        </span>
      </div>

      {/* Top AI Insights Banner */}
      {aiInsights.length > 0 && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.75rem',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#93c5fd', fontWeight: 600, marginBottom: '0.2rem' }}>
            <AlertTriangle size={13} style={{ color: '#fbbf24' }} />
            <span>AI Fleet Alert: {aiInsights[0].title}</span>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: 1.35 }}>
            {aiInsights[0].detail}
          </p>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="ai-chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`ai-bubble ${m.sender}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem', opacity: 0.8, fontSize: '0.7rem' }}>
              {m.sender === 'assistant' ? <Bot size={12} /> : <User size={12} />}
              <span>{m.sender === 'assistant' ? 'VSRMS AI Diagnostic' : 'You'}</span>
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-bubble assistant" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
            <RefreshCw size={12} className="spin" style={{ display: 'inline', marginRight: '6px' }} />
            Analyzing vehicle telematics & diagnostics...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="ai-quick-prompts">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            className="ai-prompt-chip"
            onClick={() => handleSend(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form
        className="ai-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="ai-input"
          placeholder="Ask AI about vehicle maintenance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="primary-btn"
          style={{ padding: '0.65rem 0.85rem' }}
          disabled={loading || !input.trim()}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

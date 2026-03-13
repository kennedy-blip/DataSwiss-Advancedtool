/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { Database, Upload, Zap, BrainCircuit, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  // DYNAMIC URL: Uses your Render backend in production, localhost in development
  const API_BASE = window.location.hostname === 'localhost' 
    ? "http://localhost:8000/api" 
    : "https://dataswiss-advancedtool.onrender.com/api";

  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      setData(res.data.data);
      setInsight("");
    } catch (err) { 
      const msg = err.response?.data?.detail || "Upload failed. Check if Backend is awake.";
      alert(msg); 
    }
    setLoading(false);
  };

  const onTransform = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/transform`, data);
      setData(res.data.data);
    } catch (err) { console.error("Transform error", err); }
    setLoading(false);
  };

  const onAI = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ai-insight`, data);
      setInsight(res.data.insight);
    } catch (err) { setInsight("AI Connection error. Is the Groq Key set on Render?"); }
    setLoading(false);
  };

  const onDownload = async () => {
    try {
      const res = await axios.post(`${API_BASE}/export`, data, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'dataswiss_report.md';
      link.click();
    } catch (err) { alert("Download failed"); }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}><Database size={32} color="#646cff" /> <h1>Dataswiss Pro</h1></div>
        <div style={styles.actions}>
          <label style={styles.uploadBtn}>
            <Upload size={18} /> {loading ? "Busy..." : "Import File"}
            <input type="file" onChange={onUpload} hidden accept=".csv,.json,.xlsx,.xls" />
          </label>
          <button onClick={onTransform} style={styles.btn} disabled={!data.length || loading}>Refine</button>
          <button onClick={onAI} style={{...styles.btn, background: '#8b5cf6'}} disabled={!data.length || loading}>AI Insight</button>
          <button onClick={onDownload} style={{...styles.btn, background: '#10b981'}} disabled={!data.length}>Export .MD</button>
        </div>
      </header>

      {insight && (
        <div style={styles.aiCard}>
          <BrainCircuit size={24} color="#a78bfa" />
          <div>
            <strong style={{fontSize: '1.1rem'}}>Elite Analytics Insight:</strong>
            <p style={{marginTop: '8px', lineHeight: '1.6', color: '#cbd5e1'}}>{insight}</p>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {data.length > 0 ? (
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>{Object.keys(data[0]).map(k => <th key={k}>{k.toUpperCase()}</th>)}</tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? {} : {background: '#1e293b'}}>
                    {Object.values(row).map((v, j) => <td key={j}>{v?.toString()}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.empty}>
            <FileSpreadsheet size={80} color="#1e293b" />
            <p style={{marginTop: '20px'}}>Dataswiss is ready. Upload a dataset to begin transformation.</p>
          </div>
        )}
      </div>

      {loading && (
        <div style={styles.loader}>
          <Loader2 className="spin" size={20} /> Processing...
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '2.5rem', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '20px' },
  logo: { display: 'flex', alignItems: 'center', gap: '15px' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  uploadBtn: { background: '#1e293b', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '10px', fontWeight: '600', border: '1px solid #334155' },
  btn: { border: 'none', background: '#646cff', color: 'white', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  aiCard: { background: '#1e1b4b', border: '1px solid #4338ca', padding: '1.8rem', borderRadius: '18px', marginBottom: '2.5rem', display: 'flex', gap: '20px', alignItems: 'flex-start' },
  card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '1.5rem' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  empty: { padding: '8rem', textAlign: 'center', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  loader: { position: 'fixed', bottom: '30px', right: '30px', background: '#646cff', padding: '12px 24px', borderRadius: '50px', display: 'flex', gap: '12px', alignItems: 'center', fontWeight: 'bold' }
};

export default App;
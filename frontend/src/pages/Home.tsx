import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [short, setShort] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShort('');
    if (!getToken()) { setError('Please login first'); return; }
    setLoading(true);
    try {
      const res = await api.shorten(url);
      setShort(res.short_url);
      setUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Shorten your URL</h1>
      <form onSubmit={submit}>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very-long-url" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {short && (
        <div className="result">
          <p>Your short URL:</p>
          <a href={short} target="_blank" rel="noreferrer">{short}</a>
        </div>
      )}
      {!getToken() && <p className="hint"><Link to="/login">Login</Link> to create short URLs</p>}
    </div>
  );
}

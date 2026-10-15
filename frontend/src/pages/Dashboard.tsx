import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [urls, setUrls] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUrls().then(setUrls).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="card wide">
      <h1>Your URLs</h1>
      {error && <p className="error">{error}</p>}
      {urls.length === 0 && !error && <p>No URLs yet. Create one from the Home page.</p>}
      {urls.length > 0 && (
        <table>
          <thead>
            <tr><th>Short</th><th>Original</th><th>Clicks</th><th>Created</th></tr>
          </thead>
          <tbody>
            {urls.map((u) => (
              <tr key={u.id}>
                <td><a href={`${import.meta.env.VITE_BASE_URL || ''}/${u.code}`} target="_blank" rel="noreferrer">/{u.code}</a></td>
                <td className="truncate">{u.original_url}</td>
                <td>{u.clicks}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

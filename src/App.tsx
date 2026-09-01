import { useState, useEffect } from 'react';
import './index.css';

interface Show {
  id: string;
  title: string;
  channel: string;
  description: string;
  videoCount: number;
}

interface Episode {
  id: string;
  title: string;
  sourceUrl: string;
  url: string;
}

export default function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3000/api/shows');
        if (!res.ok) throw new Error('Failed to fetch shows');
        const data = await res.json();
        setShows(data.shows);
        if (data.shows.length > 0) {
          setSelectedShow(data.shows[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  useEffect(() => {
    if (!selectedShow) return;
    const fetchEpisodes = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/episodes/${selectedShow}`);
        if (!res.ok) throw new Error('Failed to fetch episodes');
        const data = await res.json();
        setEpisodes(data.episodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    fetchEpisodes();
  }, [selectedShow]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f1419', color: '#fff', minHeight: '100vh' }}>
      <h1>🎬 AJN Broadcast Platform</h1>
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</div>}
      {loading && <div>Loading shows...</div>}
      {!loading && (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2>Shows</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {shows.map(show => (
                <div key={show.id} onClick={() => setSelectedShow(show.id)} style={{ padding: '15px', border: selectedShow === show.id ? '2px solid #0084ff' : '1px solid #444', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedShow === show.id ? '#1a1f2e' : '#111' }}>
                  <h3>{show.title}</h3>
                  <p>{show.channel}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{show.videoCount} videos</p>
                </div>
              ))}
            </div>
          </div>
          {selectedShow && (
            <div>
              <h2>Episodes - {shows.find(s => s.id === selectedShow)?.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {episodes.map(ep => (
                  <div key={ep.id} style={{ padding: '15px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#111' }}>
                    <h4>{ep.title}</h4>
                    <a href={ep.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0084ff', textDecoration: 'none' }}>▶ Play Video</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
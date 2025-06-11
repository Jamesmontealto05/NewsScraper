// frontend/src/App.js
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import ArticleCard from './components/ArticleCard';

export default function App() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keywords, setKeywords] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');

  const fetchArticles = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    setLoading(true);
    setError('');
    setArticles([]);

    try {
      const res = await axios.post('http://localhost:5000/scrape', { url });
      setArticles(res.data.articles);
    } catch (err) {
      console.error('Scraping failed:', err);
      setError(
        'Failed to scrape the news site. Make sure backend is running and CORS is enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
  if (!articles.length) return [];

  const keywordList = keywords
    .toLowerCase()
    .split(',')
    .map(k => k.trim())
    .filter(k => k);

  let filtered = articles.filter(article => {
    if (!keywordList.length) return true;
    const text = (article.headline + ' ' + (article.author || '')).toLowerCase();
    return keywordList.some(kw => text.includes(kw));
  });

  filtered = filtered.map(article => {
    const text = (article.headline + ' ' + (article.author || '')).toLowerCase();
    const relevance = keywordList.reduce(
      (count, kw) => count + (text.includes(kw) ? 1 : 0),
      0
    );

    // Normalize and parse date safely
    let parsedDate = article.date ? new Date(article.date) : null;
    if (parsedDate && isNaN(parsedDate)) parsedDate = null;

    return { ...article, relevance, parsedDate };
  });

  if (sortOption === 'dateAsc') {
    filtered.sort((a, b) => {
      if (!a.parsedDate) return 1;
      if (!b.parsedDate) return -1;
      return a.parsedDate - b.parsedDate;
    });
  } else if (sortOption === 'dateDesc') {
    filtered.sort((a, b) => {
      if (!a.parsedDate) return 1;
      if (!b.parsedDate) return -1;
      return b.parsedDate - a.parsedDate;
    });
  } else if (sortOption === 'relevance') {
    filtered.sort((a, b) => b.relevance - a.relevance);
  }

  return filtered;
}, [articles, keywords, sortOption]);

  return (
    <div className="container">
      <h1>James News Scraper</h1>

      <div className="flex-row">
        <input
          type="url"
          placeholder="Enter website URL (e.g. https://cnn.com)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
          className="flex-grow"
        />
        <button onClick={fetchArticles} disabled={loading}>
          {loading && <div className="loading-spinner" />}
          {loading ? ' Scraping...' : 'Scrape'}
        </button>
      </div>

      <div className="flex-row">
        <input
          type="text"
          placeholder="Filter keywords (comma separated)"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          disabled={loading}
          className="flex-grow"
        />

        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          disabled={loading}
        >
          <option value="dateDesc">Sort by Date ↓</option>
          <option value="dateAsc">Sort by Date ↑</option>
          <option value="relevance">Sort by Relevance</option>
        </select>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {filteredAndSorted.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 20 }}>No articles match your filter.</p>
      ) : (
        filteredAndSorted.map((article, idx) => (
          <ArticleCard
            key={idx}
            article={article}
            defaultSource="Unknown Source"
          />
        ))
      )}

      <footer>
        © 2025 News Scraper • Built with React & Puppeteer
      </footer>
    </div>
  );
}

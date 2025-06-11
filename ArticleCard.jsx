import React from 'react';
import './ArticleCard.css'; // import the CSS

export default function ArticleCard({ article, defaultSource }) {
  return (
    <div className="article-card">
      {article.url ? (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-title"
        >
          {article.headline}
        </a>
      ) : (
        <div className="article-title">{article.headline}</div>
      )}

      <div className="article-meta">
        {article.author && <span className="article-author">Author: {article.author}</span>}
        {article.date && (
          <span className="article-date">
            Published:{' '}
            {new Date(article.date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        )}
        <span className="article-source">Source: {article.source || defaultSource}</span>
      </div>
    </div>
  );
}

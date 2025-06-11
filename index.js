// backend/index.js

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route
app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const hostname = new URL(url).hostname;

    const articles = [];
    $('h1, h2, h3').each((i, el) => {
      const headline = $(el).text().trim();
      if (headline) {
        articles.push({
          headline,
          author: '', // You can enhance logic to extract author
          date: '', // You can enhance logic to extract date
          url,
          source: hostname
        });
      }
    });

    await browser.close();

    res.json({ articles });
  } catch (error) {
    console.error('Scraping failed:', error.message);
    res.status(500).json({ error: 'Scraping failed. Please check the URL.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

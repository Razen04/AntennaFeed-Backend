const express = require('express')
const axios = require('axios')
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const cors = require('cors');
let feedParser = require('rss-parser');
let parser = new feedParser();
const puppeteer = require('puppeteer-extra');
const { opmlToJSON } = require('opml-to-json');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { Parser } = require('htmlparser2')
const cheerio = require('cheerio')

puppeteer.use(stealth)

const app = express()
const port = 3000;

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));

const extractImageSrc = (html) => {
    let src = null;

    const parserr = new Parser({
        onopentag(name, attributes) {
            if (name === "img" || name === "picture" || name === "source" && attributes.src || attributes.srcset) {
                src = attributes.src || attributes.srcset;
            }
        }
    }, { decodeEntities: true });

    parserr.write(html);
    parserr.end();

    return src;
};

const fetchImageFromOriginalArticle = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Try to get the Open Graph image or first img tag
        const imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('img').first().attr('src');

        if (imageUrl) {
            console.log('Found image URL:', imageUrl);
            // Return the image URL or use it to update the feed in your backend
            return imageUrl;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching the article:', error);
    }
};


const fetchArticleUsingPuppeteer = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    await page.waitForSelector('body');

    const content = await page.evaluate(() => {
        return document.body.innerHTML;  // Or use specific DOM parsing here
    });

    await browser.close();
    return content;
};

app.post('/fetch-article', async (request, response) => {
    const { url } = request.body;

    if (!url) {
        response.status(400).json({ error: 'Url is required' })
    }

    try {
        const html = await fetchArticleUsingPuppeteer(url);
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const parsedArticle = reader.parse();
        const hasMediaTags = /<img|<figure|<source/.test(parsedArticle.content);
        const image = !hasMediaTags ? await fetchImageFromOriginalArticle(url) : null;
        const article = {
            feed: parsedArticle,
            image: image
        }

        const modifiedHTML = article.feed.content.replace(/<a(?![^>]*target="_blank")/g, '<a target="_blank" rel="noopener noreferrer" ');

        response.json({
            ...article, feed: {
                ...article.feed,
                content: modifiedHTML
            }
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Failed to fetch the article' });
    }
});


app.post('/fetch', async (request, response) => {
    const { feedLink } = request.body;

    if (!feedLink) {
        return response.status(400).json({ error: "Url is required" });
    }

    try {
        const feed = await parser.parseURL(feedLink);

        // Filter articles published in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filteredArticles = feed.items.filter(item => {
            const pubDate = new Date(item.pubDate);
            return pubDate >= thirtyDaysAgo; // Include only articles from the last 30 days
        });

        // Sort the filtered articles by publication date (most recent first)
        const sortedArticles = filteredArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Limit to approximately 1000 articles
        const limitedArticles = sortedArticles.slice(0, 500);

        // Map the articles to the desired structure
        const relevantFeedData = {
            title: feed.title,
            link: feed.link,
            description: feed.description || null,
            author: feed.author || feed.creator,
            items: await Promise.all(limitedArticles.map(async (item) => {
                const image = extractImageSrc(item.content) || null;

                return {
                    id: item.link,
                    title: item.title,
                    link: item.link,
                    author: item.author || item.creator || item.byline,
                    pubDate: item.pubDate,
                    image: image,
                    content: item.contentSnippet
                };
            }))
        };

        console.log(feed.title);
        return response.json({ relevantFeedData });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Failed to fetch the article' });
    }
});


app.post('/opmltojson', async (req, res) => {
    try {
        const opmlContent = req.body.body;

        const content = await opmlToJSON(opmlContent);
        res.json(content);
    } catch (error) {
        console.error('Error processing OPML:', error);
        res.status(500).json({ error: error.message });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
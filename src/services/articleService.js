const axios = require('axios');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const cheerio = require('cheerio');
const { fetchImageFromOriginalArticle } = require('../utils/helpers');

puppeteer.use(stealth);

const fetchArticleUsingReadability = async (url) => {
    try {
        const response = await axios.get(url);
        const html = response.data;

        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const parsedArticle = reader.parse();

        if (parsedArticle) {
            return { content: parsedArticle.content };
        } else {
            return await fetchArticleUsingPuppeteer(url);
        }
    } catch (error) {
        console.error('Error in Readability fetch:', error);
        return await fetchArticleUsingPuppeteer(url);
    }
};

const fetchArticleUsingPuppeteer = async (url) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForSelector('body');

    const content = await page.evaluate(() => {
        const mainContent = document.querySelector('main, article, .post, .content');
        return mainContent ? mainContent.innerHTML : document.body.innerHTML;
    });

    await browser.close();
    return { content: content };
};

exports.fetchArticle = async (url) => {
    const { content } = await fetchArticleUsingReadability(url);

    const dom = new JSDOM(content, { url });
    const reader = new Readability(dom.window.document);
    const parsedArticle = reader.parse();

    console.log("Article is parsed.");
    const hasMediaTags = /<img|<figure|<source/.test(parsedArticle.content);
    const image = !hasMediaTags ? await fetchImageFromOriginalArticle(url) : null;

    const modifiedHTML = parsedArticle.content.replace(/<a(?![^>]*target="_blank")/g, '<a target="_blank" rel="noopener noreferrer" ');

    return {
        feed: { ...parsedArticle, content: modifiedHTML },
        image: image,
    };
};
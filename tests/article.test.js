const articleService = require('../src/services/articleService');
const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

jest.mock('axios');
jest.mock('puppeteer-extra');

describe('Article Service', () => {
    it('should fetch and parse an article using Readability', async () => {
        const url = 'http://example.com';
        const html = '<html><body><article>Test Article</article></body></html>';
        axios.get.mockResolvedValue({ data: html });

        const articleData = await articleService.fetchArticle(url);
        expect(articleData.feed.content).toContain('Test Article');
    });

    it('should fallback to Puppeteer if Readability fails', async () => {
        const url = 'http://example.com';
        axios.get.mockRejectedValue(new Error('Network error'));

        const browser = {
            newPage: jest.fn().mockResolvedValue({
                goto: jest.fn(),
                waitForSelector: jest.fn(),
                evaluate: jest.fn().mockResolvedValue('<article>Test Article</article>'),
                close: jest.fn(),
            }),
            close: jest.fn(),
        };
        puppeteer.launch.mockResolvedValue(browser);

        const articleData = await articleService.fetchArticle(url);
        expect(articleData.feed.content).toContain('Test Article');
    });
});
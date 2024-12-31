const feedService = require('../src/services/feedService');
const Parser = require('rss-parser');

jest.mock('rss-parser');

describe('Feed Service', () => {
    it('should fetch and parse a feed', async () => {
        const feedLink = 'http://example.com/feed';
        const feed = {
            title: 'Test Feed',
            link: 'http://example.com',
            items: [
                { title: 'Article 1', link: 'http://example.com/1', pubDate: new Date().toISOString() },
                { title: 'Article 2', link: 'http://example.com/2', pubDate: new Date().toISOString() },
            ],
        };
        Parser.prototype.parseURL.mockResolvedValue(feed);

        const feedData = await feedService.fetchFeed(feedLink);
        expect(feedData.title).toBe('Test Feed');
        expect(feedData.items.length).toBe(2);
    });

    it('should handle errors when fetching a feed', async () => {
        const feedLink = 'http://example.com/feed';
        Parser.prototype.parseURL.mockRejectedValue(new Error('Network error'));

        await expect(feedService.fetchFeed(feedLink)).rejects.toThrow('Failed to fetch the feed');
    });
});
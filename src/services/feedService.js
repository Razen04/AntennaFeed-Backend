const Parser = require('rss-parser');
const { extractImageSrc } = require('../utils/helpers');
const parser = new Parser();

exports.fetchFeed = async (feedLink) => {
    const feed = await parser.parseURL(feedLink);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let filteredArticles = feed.items.filter(item => {
        const pubDate = new Date(item.pubDate);
        return pubDate >= thirtyDaysAgo;
    });

    if (filteredArticles.length === 0) {
        filteredArticles = feed.items;
    }

    const sortedArticles = filteredArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const limitedArticles = sortedArticles.slice(0, 500);

    const relevantFeedData = {
        title: feed.title,
        link: feed.link,
        description: feed.description || null,
        author: feed.author || feed.creator || feed.byline,
        items: await Promise.all(limitedArticles.map(async (item) => {
            const image = extractImageSrc(item.content) || null;

            return {
                id: item.link,
                title: item.title,
                link: item.link,
                author: item.author || item.creator || item.byline,
                pubDate: item.pubDate,
                image: image,
                isRead: false,
                isStarred: false
            };
        }))
    };

    return relevantFeedData;
};
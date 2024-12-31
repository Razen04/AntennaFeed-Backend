const feedService = require('../services/feedService');

exports.fetchFeed = async (req, res) => {
    const { feedLink } = req.body;

    if (!feedLink) {
        return res.status(400).json({ error: "Url is required" });
    }

    try {
        const feedData = await feedService.fetchFeed(feedLink);
        res.json({ relevantFeedData: feedData });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch the feed' });
    }
};
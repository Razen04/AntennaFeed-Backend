const articleService = require('../services/articleService');

exports.fetchArticle = async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Url is required' });
    }

    try {
        const articleData = await articleService.fetchArticle(url);
        res.json(articleData);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch the article' });
    }
};
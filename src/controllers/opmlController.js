const opmlService = require('../services/opmlService');

exports.convertOpmlToJson = async (req, res) => {
    try {
        const opmlContent = req.body.body;
        const jsonData = await opmlService.convertOpmlToJson(opmlContent);
        res.json(jsonData);
    } catch (error) {
        console.error('Error processing OPML:', error);
        res.status(500).json({ error: error.message });
    }
};
const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('htmlparser2');

exports.extractImageSrc = (html) => {
    let src = null;

    const parser = new Parser({
        onopentag(name, attributes) {
            console.log(`Tag: ${name}, Attributes:`, attributes); // Debugging log
            if ((name === "img" || name === "picture" || name === "source") && (attributes.src || attributes.srcset)) {
                src = attributes.src || attributes.srcset;
            }
        }
    }, { decodeEntities: true });

    parser.write(html);
    parser.end();

    return src;
};

exports.fetchImageFromOriginalArticle = async (url) => {
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
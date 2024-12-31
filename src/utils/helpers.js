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
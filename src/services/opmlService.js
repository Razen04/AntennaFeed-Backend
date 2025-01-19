const { opmlToJSON } = require('opml-to-json');
const { v4: uuidv4 } = require('uuid');

exports.convertOpmlToJson = async (opmlContent) => {
    const content = await opmlToJSON(opmlContent);

    const getFavicon = async (link) => {
        try {
            const url = new URL(link);

            let domain = url.hostname;
            if (domain === "openrss.org") {
                const pathParts = url.pathname.split("/");
                if (pathParts[1]) {
                    domain = pathParts[1];
                }
            }

            const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
            console.log("IconUrl: ", iconUrl);
            return iconUrl;
        } catch (error) {
            console.error("Invalid URL or error fetching favicon:", error);
            return null;
        }
    };

    async function addIdsAndDefaults(node, parentFolder = null, depth = 1) {
        console.log("Node: ", node);
        node.id = uuidv4();
        node.selected = false;
        node.folder = parentFolder ? parentFolder : null;
        node.level = depth;
        node.type = (depth === 2) ? 'main-parent' : 'sub-parent';

        if (node.xmlurl) {
            node.icon = await getFavicon(node.xmlurl);
        } else {
            node.icon = null;
        }

        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => {
                addIdsAndDefaults(child, node.title, depth + 1);
            });
        }
    }

    if (Array.isArray(content)) {
        content.forEach(addIdsAndDefaults);
    } else {
        addIdsAndDefaults(content);
    }

    return content;
};
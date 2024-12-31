const { opmlToJSON } = require('opml-to-json');
const { v4: uuidv4 } = require('uuid');

exports.convertOpmlToJson = async (opmlContent) => {
    const content = await opmlToJSON(opmlContent);

    function addIdsAndDefaults(node, parentFolder = null, depth = 1) {
        node.id = uuidv4();
        node.selected = false;
        node.folder = parentFolder ? parentFolder : null;
        node.level = depth;
        node.type = (depth === 2) ? 'main-parent' : 'sub-parent';

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
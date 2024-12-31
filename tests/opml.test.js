const opmlService = require('../src/services/opmlService');
const { v4: uuidv4 } = require('uuid');

jest.mock('uuid');

describe('OPML Service', () => {
    it('should convert OPML to JSON', async () => {
        const opmlContent = '<opml><body><outline text="Feed 1" /></body></opml>';
        const expectedJson = [
            {
                id: 'uuid-1',
                selected: false,
                folder: null,
                level: 1,
                type: 'main-parent',
                text: 'Feed 1',
                children: [],
            },
        ];
        uuidv4.mockReturnValueOnce('uuid-1');

        const jsonData = await opmlService.convertOpmlToJson(opmlContent);
        expect(jsonData).toEqual(expectedJson);
    });

    it('should add IDs and defaults to nested nodes', async () => {
        const opmlContent = '<opml><body><outline text="Folder"><outline text="Feed 1" /></outline></body></opml>';
        const expectedJson = [
            {
                id: 'uuid-1',
                selected: false,
                folder: null,
                level: 1,
                type: 'main-parent',
                text: 'Folder',
                children: [
                    {
                        id: 'uuid-2',
                        selected: false,
                        folder: 'folder',
                        level: 2,
                        type: 'sub-parent',
                        text: 'Feed 1',
                        children: [],
                    },
                ],
            },
        ];
        uuidv4.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

        const jsonData = await opmlService.convertOpmlToJson(opmlContent);
        expect(jsonData).toEqual(expectedJson);
    });
});
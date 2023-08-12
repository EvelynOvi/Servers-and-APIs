const http = require('http');
const fs = require('fs');
const path = require('path');

const ITEMS_FILE_PATH = path.join(__dirname, 'items.json');

// Read and parse items data from the items.json file
function readItemsFromFile() {
    try {
        const data = fs.readFileSync(ITEMS_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Write items data to the items.json file
function writeItemsToFile(items) {
    fs.writeFileSync(ITEMS_FILE_PATH, JSON.stringify(items, null, 2));
}

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (url === '/items' && method === 'GET') {
        // Get all items
        const items = readItemsFromFile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(items));
    } else if (url.startsWith('/items/') && method === 'GET') {
        // Get one item
        const itemId = url.split('/items/')[1];
        const items = readItemsFromFile();
        const item = items.find(item => item.id === itemId);

        if (item) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else if (url === '/items' && method === 'POST') {
        // Create item
        let requestBody = '';
        req.on('data', chunk => {
            requestBody += chunk.toString();
        });

        req.on('end', () => {
            const newItem = JSON.parse(requestBody);
            const items = readItemsFromFile();
            items.push(newItem);
            writeItemsToFile(items);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
        });
    } else if (url.startsWith('/items/') && method === 'PUT') {
        // Update item
        const itemId = url.split('/items/')[1];
        let requestBody = '';
        req.on('data', chunk => {
            requestBody += chunk.toString();
        });

        req.on('end', () => {
            const updatedItem = JSON.parse(requestBody);
            const items = readItemsFromFile();
            const itemIndex = items.findIndex(item => item.id === itemId);

            if (itemIndex !== -1) {
                items[itemIndex] = { ...items[itemIndex], ...updatedItem };
                writeItemsToFile(items);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(items[itemIndex]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });
    } else if (url.startsWith('/items/') && method === 'DELETE') {
        // Delete item
        const itemId = url.split('/items/')[1];
        const items = readItemsFromFile();
        const updatedItems = items.filter(item => item.id !== itemId);

        if (updatedItems.length !== items.length) {
            writeItemsToFile(updatedItems);
            res.writeHead(204);
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

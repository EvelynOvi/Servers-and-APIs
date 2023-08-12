const http = require('http');
const fs = require('fs');
const path = require('path');


const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, url);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, send a 404 response
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(fs.readFileSync(path.join(__dirname, 'error.html')));
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
            }
        } else {
            // Serve the file
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
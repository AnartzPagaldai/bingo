const http = require('http');
const fs = require('fs');
let numeros = [];

const server = http.createServer((req, res) => {
    uri = req.url.split("?")
    if (req.method == "GET") {
        switch (uri[0]) {
            case "/":
                sendFile(res, "./index.html", "text/html") 
                break;
            case "/admin":
                if (uri[1] == "12345678910") {
                    sendFile(res, "./admin.html", "text/html")
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 not found');
                }
                break;
            case "/clear":
                if (uri[1] == "12345678910") {
                    numeros = [];
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 not found');
                }
                break;
            default: 
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 not found');
        }
    } else if (req.method == "POST") {
        switch(uri[0]) {
            case "/sacarNumero":
                if (uri[1] == "12345678910") {
                    let data = '';
                    req.on('data', (chunk) => {
                        data += chunk;
                    });

                    req.on('end', () => {
                        numeros = JSON.parse(data);
                        console.log(numeros)
                        res.end("ok");
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 not found');
                }
                break;
        }
    }
});

function sendFile(res, fileName, type) {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 not found');
        } else {
            res.writeHead(200, { 'Content-Type': type });
            res.end(data);
        }
    });
}

const puerto = 80;
const direccion = '0.0.0.0'//'172.20.224.107';
server.listen(puerto, direccion, () => {
    console.log(`Servidor en http://${direccion}:${puerto}/`);
});


const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
let numeros = [];
let jugadores = new Map();
let sal = Math.random() * 1000;
let bingo = false;

const server = http.createServer((req, res) => {
    uri = req.url.split("?")
    if (req.method == "GET") {
        let cookie;
        switch (uri[0]) {
            case "/":
                cookie = getCookie("jugador", req);
                if (!cookie || !jugadores.has(cookie[1])) {
                    if (numeros.length != 0) {
                        res.end("espera a que acabe la partida");
                        break
                    }
                    const hash = crypto.createHash('sha256');
                    hash.update((jugadores.size + sal).toString());
                    let key = hash.digest('hex');
                    jugadores.set(key, generateUniqueRandomNumbers(1, 75, 16));
                    res.setHeader('Set-Cookie', [`jugador=${key}; HttpOnly`])
                }
                
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
                    jugadores.clear();
                    sal = Math.random() * 1000;
                    bingo = false;
                    res.end("ok");
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 not found');
                }
                break;
            case "/getNumbers": 
                cookie = getCookie("jugador", req);
                if (cookie) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    let array = jugadores.get(cookie[1]);
                    if (array) {
                        res.end(JSON.stringify(array));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 not found');
                    }
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 not found');
                }             
                break;
            case "/comprobarAdmin":
                res.end(bingo ? "bingo" : "no es bingo");
                break;
            case "/comprobar":
                cookie = getCookie("jugador", req);
                if (cookie) {
                    let numerosJugador = jugadores.get(cookie[1])
                    let cont = 0;
                    for (let i = 0; i < numeros.length; i++) {
                        if (numeros[i] == numerosJugador[cont]) {
                           cont++; 
                        }
                    }

                    if (cont == 16) {
                        bingo = true;
                        res.end("bingo")
                    } else {
                        res.end("no es bingo");
                    }
                    break;
                }             

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

function getCookie(name, req) {
    let cookies = req.headers.cookie;
    if (cookies) {
        cookies = cookies.split(";");
        for (let cookie of cookies) {
            cookie = cookie.split('=');
            if (name == cookie[0].trim()) {
                return cookie;
            }
        }
    }
    return null;
}

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

function generateUniqueRandomNumbers(min, max, count) {
    const numbers = new Set();
    while (numbers.size < count) {
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(number);
    }
    arrayNum = Array.from(numbers);
    return arrayNum.sort((a, b) => a - b);
}

const puerto = 80;
const direccion = '0.0.0.0';
server.listen(puerto, direccion, () => {
    console.log(`Servidor en http://${direccion}:${puerto}/`);
});


const http = require('http');
const { MongoClient } = require('mongodb');
require("dotenv").config();

class MongoDB {
    constructor() {
        if (!MongoDB.instance) {
            this.url = process.env.URI;
            this.dbName = "heroic_cards";
            this.collectionName = "players";
            this.client = new MongoClient(this.url);
            this.db = null;
            this.collection = null;
            MongoDB.instance = this;
        }
        return MongoDB.instance;
    }

    async connect() {
        if (!this.db) {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
        }
    }

    async get(id, name) {
        await this.connect();
        const player = await this.collection.findOne({ id });
        return player || {};
    }
}


const db = new MongoDB();
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');

    if (req.method === 'GET' && id) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify((await db.get(id))));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ID missing.' }));
    }
});

server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
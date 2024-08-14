import { XperiError } from "./xperiError.js";
export class RequestXperi {
    req;
    $;
    body = {};
    constructor(req) {
        this.req = req;
        this.$ = req;
    }
    async setBodyJson() {
        return await new Promise((resolve, reject) => {
            let body = '';
            this.req.on('data', chunk => {
                body += chunk.toString();
            });
            this.req.on('end', () => {
                try {
                    this.body = JSON.parse(body);
                    resolve();
                }
                catch (error) {
                    reject(new XperiError('Invalid JSON'));
                }
            });
            this.req.on('error', err => {
                reject(err);
            });
        });
    }
    async setBody() {
        return await new Promise((resolve, reject) => {
            let body = '';
            this.req.on('data', chunk => {
                body += chunk.toString();
            });
            this.req.on('end', () => {
                try {
                    this.body = body;
                    resolve(this.body);
                }
                catch (error) {
                    reject(new XperiError('Invalid JSON'));
                }
            });
            this.req.on('error', err => {
                reject(err);
            });
        });
    }
}

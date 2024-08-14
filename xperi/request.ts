import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { XperiError } from './xperiError.js';
import Busboy from 'busboy';
import fs from "fs";
import formidable, {errors as formidableErrors} from 'formidable';

export class RequestXperi {
    $: IncomingMessage;
    public body: object | string | null | undefined = {};
    public contentType: string | undefined;
    public files: { [key: string]: any } = {};

    constructor(req: IncomingMessage) {
        this.$ = req;
        this.contentType = this.$.headers['content-type'];
    }

    async setBodyJson(): Promise<void> {
        return await new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => {
                body += chunk.toString();
            });

            this.$.on('end', () => {
                try {
                    this.body = {}; JSON.parse(`{"body" : "teste"}`);
                    resolve();
                } catch (error) {
                    reject(new XperiError('Invalid JSON')); 
                }
            });

            this.$.on('error', err => {
                reject(err); 
            });
        });
    }

    processMultipart(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.contentType?.startsWith('multipart/form-data')) {
                throw new Error('Content-Type is not multipart/form-data');
            }
            const form = formidable({
                uploadDir : "../../src/uploads"
            });

            form.parse(this.$, (erro, campos, arquivos) => {
                console.log('caiu aqui')
            })
      });
    }

    private bufferSplit(buffer: Buffer, separator: string | Buffer): Buffer[] {
        const result: Buffer[] = [];
        let start = 0;
        let end;
        
        while ((end = buffer.indexOf(separator, start)) !== -1) {
            result.push(buffer.slice(start, end));
            start = end + separator.length;
        }
        
        result.push(buffer.slice(start));
        return result;
    }

    private getBoundary(): string | undefined {
        const contentType = this.contentType || '';
        const match = /boundary=([^;]+)/.exec(contentType);
        return match ? match[1] : undefined;
    }

    getContentType() {
        return this.$.headers['content-type'];
    }

    async setBody() {
        return await new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => {
                body += chunk.toString();
            });

            this.$.on('end', () => {
                try {
                    this.body = body;
                    resolve(this.body);
                } catch (error) {
                    reject(new XperiError('Invalid JSON')); 
                }
            });

            this.$.on('error', err => {
                reject(err); 
            });
        });
    }

    pipe(destination: NodeJS.WritableStream, options?: { end?: boolean | undefined } | undefined): NodeJS.WritableStream {
        return this.$.pipe(destination, options);
    }
}

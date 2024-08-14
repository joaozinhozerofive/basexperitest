import http from 'http';
import { ResponseXperi } from './response.js';
import { RequestXperi } from './request.js';
export var xperiFrame;
(function (xperiFrame) {
    class Xperi {
        server = null;
        port = null;
        useJson = false;
        callbacks = [];
        cbError = async () => { };
        use(...callbacks) {
            this.callbacks.push(...callbacks);
        }
        configError(cbError) {
            this.cbError = cbError;
        }
        listen(port, callback) {
            this.server = http.createServer(async (req, res) => {
                this.implementMiddleware(req, res);
            });
            this.port = port;
            this.server.listen(port, () => {
                callback && callback();
            });
        }
        async implementMiddleware(req, res) {
            const response = new ResponseXperi(res);
            const request = new RequestXperi(req);
            this.useJson ? await request.setBodyJson() : await request.setBody();
            let toNextFunction = false;
            this.callbacks && this.callbacks.forEach(async (middleware, index) => {
                const next = () => {
                    toNextFunction = true;
                };
                if (toNextFunction || [0].includes(index)) {
                    try {
                        await middleware(request, response, next);
                    }
                    catch (error) {
                        await this.cbError(error, request, response);
                    }
                }
            });
        }
        useJSON() {
            this.useJson = true;
        }
        uploadedFile(field) {
            return this.middlewareUploadedFile;
        }
        async middlewareUploadedFile(req, res, next) {
            try {
            }
            catch (error) {
                console.log('caiu no erro');
            }
            finally {
                console.log('indo para próxima função.');
                next();
            }
        }
        close() {
            this.server?.close();
        }
    }
    xperiFrame.Xperi = Xperi;
    xperiFrame.xperi = new Xperi();
})(xperiFrame || (xperiFrame = {}));
const xperi = () => xperiFrame.xperi;
export default xperi;

import http, { IncomingMessage, ServerResponse, Server }  from 'http';
import { ResponseXperi } from './response.js';
import { RequestXperi } from './request.js';
import { XperiUploadedFile } from './xperiUploadFiles/xperiUploadedFiles.js';

export namespace DeclaresTypes {
    export type NextFunction       = () => void;
    export type ErrorHandler       = Error | undefined;
    export type CallbacksProps     = ((req : RequestProps, res : ResponseProps, next : NextFunction, server?: XperiInstance) => Promise<void | object>)[];
    export type CallbackErrorProps = ((error : unknown, req : RequestProps, res : ResponseProps) => Promise<void | object>);
}

export type NextFunction       = DeclaresTypes.NextFunction ;
export type ErrorHandler       = DeclaresTypes.ErrorHandler;
export type CallbacksProps     = DeclaresTypes.CallbacksProps;
export type CallbackErrorProps = DeclaresTypes.CallbackErrorProps;

 export namespace xperiFrame {

      export class Xperi {
        private server : Server  | null =  null;
        private port : Number | null = null;
        public useJson : boolean = false;
        private callbacks : DeclaresTypes.CallbacksProps = [];
        private cbError   : DeclaresTypes.CallbackErrorProps = async () => {}; 

        use(...callbacks : DeclaresTypes.CallbacksProps) {
            this.callbacks.push(...callbacks);
        }

        configError(cbError : DeclaresTypes.CallbackErrorProps) {
            this.cbError =  cbError;
        }

        listen( port : number, callback? : () => void ) {
            this.server = http.createServer(async (req : IncomingMessage, res : ServerResponse) => {
                this.implementMiddleware(req, res);
            });

            this.port = port;
            this.server.listen(port, () => {
                callback && callback();
            });
        }

        private async implementMiddleware(req : IncomingMessage, res : ServerResponse) {
            const response = new ResponseXperi(res);
            const request  = new RequestXperi(req);

            this.useJson && request.contentType == 'application/json' ? await request.setBodyJson() : await request.setBody(); 

            let toNextFunction = false;
            
            this.callbacks && this.callbacks.forEach(async (middleware, index) => {
                const next = () => {
                    toNextFunction = true;
                };

                if(toNextFunction || [0].includes(index)) {
                    try {
                        await middleware(request, response, next, this);
                    }catch (error) {
                        await this.cbError(error, request, response);
                    }
                }
            });
        }
        
        useJSON() {
            this.useJson = true;
        } 

        uploadedFile(field : string, options?: object) {
            return this.middlewareUploadedFile(field, options);
        }

        middlewareUploadedFile(field : string, options?: object) {
            return (new XperiUploadedFile(field, {teste : 'teste'})).getMiddleware();
        }

        close() {
            this.server?.close();
        }
    }

    export const xperi =  new Xperi();
}

const xperi = () => xperiFrame.xperi; 
export default xperi

export interface ResponseProps extends ResponseXperi{} 
export interface RequestProps extends RequestXperi{}
export interface XperiInstance extends  xperiFrame.Xperi{};
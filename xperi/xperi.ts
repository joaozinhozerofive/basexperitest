import http, { IncomingMessage, ServerResponse, Server }  from 'http';
import { ResponseXperi } from './response.js';
import { OptionsFilesProps, RequestXperi } from './request.js';
import { GlobalsFeatures } from './globalsFeatures.js';

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
export type OptionsFiles       = OptionsFilesProps;

 export namespace xperiFrame {

      export class Xperi {
        private server : Server  | null =  null;
        private port : Number | null = null;
        public useJson : boolean = false;
        private callbacks : DeclaresTypes.CallbacksProps = [];
        private cbError   : DeclaresTypes.CallbackErrorProps = async () => {}; 
        private fieldsFile : string[] = [];
        private optionsFiles : OptionsFiles = {};

        constructor() {
            new GlobalsFeatures();
        }

        setFieldsFile(fieldsFile : string[]) {
            this.fieldsFile = fieldsFile; 
        }

        setOptionsFiles(optionsFiles : OptionsFiles) {
            this.optionsFiles = optionsFiles;
        }

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
            if(request.contentType == 'application/json') {
                await request.setBodyJson();
            }
            else if(request.contentType?.split(';')[0] == 'multipart/form-data') {
                request.setFieldsFile(this.fieldsFile);
                request.setOptionsFiles(this.optionsFiles);
                await request.processMultipart();
            }
            else {
                await request.setBody();
            }

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

        uploadedFiles(fields : string[], options: OptionsFiles) {
            this.setFieldsFile(fields)
            this.setOptionsFiles(options);
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
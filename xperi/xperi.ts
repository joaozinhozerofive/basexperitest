import http, { IncomingMessage, ServerResponse, Server, request }  from 'http';
import { ResponseXperi } from './response.js';
import { OptionsFilesProps, RequestXperi } from './request.js';
import { GlobalsFeatures } from './globalsFeatures.js';
import { ObjectRouter, UseRouterXperi } from './xperiRouter/xperiRouter.js';
import url from "url";

export namespace DeclaresTypes {
    export type NextFunction       = () => void;
    export type ErrorHandler       = Error | undefined;
    export type CallbacksProps     = ((req? : RequestProps, res? : ResponseProps, next? : NextFunction, server?: XperiInstance) => Promise<any>)[] | any[];
    export type CallbackErrorProps = ((error : unknown, req : RequestProps, res : ResponseProps) => Promise<void | object>);
    export type ObjectMultipart    = {fields : string[], options : OptionsFiles};
    export type ListenProps         = { port : number,  host? : string, callback? : () => void};
}

export type NextFunction       = DeclaresTypes.NextFunction ;
export type ErrorHandler       = DeclaresTypes.ErrorHandler;
export type CallbacksProps     = DeclaresTypes.CallbacksProps;
export type CallbackErrorProps = DeclaresTypes.CallbackErrorProps;
export type OptionsFiles       = OptionsFilesProps;
export type ObjectMultipart    = DeclaresTypes.ObjectMultipart;
export type ListenProps        = DeclaresTypes.ListenProps;

 export namespace xperiFrame {

      export class Xperi {
        private server : Server  | null =  null;
        private port : number | null = null;
        useJson : boolean = false;
        private callbacks : DeclaresTypes.CallbacksProps = [];
        cbConfigError   : DeclaresTypes.CallbackErrorProps = async () => {}; 
        optionsFiles : OptionsFilesProps = {keepExtensions : true};
        fieldsFiles : string[] | undefined = [];
        cbRoutes : CallbacksProps = [];

        constructor() {
            new GlobalsFeatures();
        }

        use(...callbacks : DeclaresTypes.CallbacksProps) {
            this.callbacks.push(...callbacks);
        }

        configError(cbConfigError : DeclaresTypes.CallbackErrorProps) {
            this.cbConfigError =  cbConfigError;
        }

        listen({port, host = undefined,  callback} : ListenProps) {
            this.server = http.createServer(async (req : IncomingMessage, res : ServerResponse) => {
                const response = new ResponseXperi(res);
                const request  = new RequestXperi(req);  
                this.implementMiddleware(request, response);
            });

            this.port = port;
            this.server.listen(port, host, () => {
                callback && callback();
            });
        }

        private async implementMiddleware(req : RequestProps, res : ResponseProps) {
            try {
                await this.setContentRequest(req);
                const parsedUrl = url.parse(req.url, true)
                req.setQueryParams(parsedUrl.query);
                let nextFunction = false;
                const next = () => {
                    nextFunction = true;
                };

                for(let i = 0; i < this.callbacks?.length; i++) {
                    if(nextFunction || i === 0) {
                        try {
                            nextFunction = false;
                            await this.executeCallback(req, res, next, i);
                        }catch (error) {
                            await this.cbConfigError(error, req, res);
                            break;
                        }
                    } 
                    else {
                        break;
                    }
                }
            } catch(error) {
                await this.cbConfigError(error, req, res);
            }
        }

        private async executeCallback(request : RequestProps, response : ResponseProps, next : NextFunction, index : number) {
            try {
                if (this.callbacks[index] instanceof UseRouterXperi.XperiRouter) {
                    await this.executeRoutes(request, response, next, index);
                    next();
                    return;
                }
                await this.callbacks[index](request, response, next, this);
            } catch (error) {
                await this.cbConfigError(error, request, response);
            }
        }
        
        private async executeRoutes(request : RequestProps, response : ResponseProps, next : NextFunction, index : number) {
            const fnCallback : ObjectRouter = this.callbacks[index];

            fnCallback.executeRoutes(request, response, this); 
        }

        async setContentRequest(request : RequestProps) {
            if(request.contentType == 'application/json') {
                await request.setBodyJson();
            } 
            else if(request.contentType?.split(';')[0] == 'multipart/form-data') {
                await this.setConfigUploads(request);
            }     
            else {
                await request.setBody();
            }
        }

        private async setConfigUploads(request : RequestProps) {
            request.setFieldsFile(this.fieldsFiles);
            request.setOptionsFiles(this.optionsFiles);
            await request.processMultipart();
        }
        
        uploadedFiles(fields : string[], options: OptionsFiles) {
            const objectMultipart = {
                fields, 
                options
            }

            this.setFieldsFile(fields);
            this.setOptionsFiles(options);

            return this.middlewareUploaded.bind(objectMultipart);
        }

        setFieldsFile(fieldsFiles? : string[]) {
            this.fieldsFiles = fieldsFiles; 
        }

        setOptionsFiles(optionsFiles : OptionsFilesProps) {
            this.optionsFiles = optionsFiles;
        }

        async middlewareUploaded(this : ObjectMultipart, req : RequestProps, res : ResponseProps, next : NextFunction) {
            req.setFieldsFile(this.fields);
            req.setOptionsFiles(this.options);
            next();
        }

        close() {
            this.server?.close();
        }

        useRoutes(...cbRoutes : CallbacksProps) {
            this.cbRoutes = cbRoutes;
        }
    }

    export const xperi =  new Xperi();
}

const xperi = () => xperiFrame.xperi; 
export const Router = () => new UseRouterXperi.XperiRouter;
export interface ResponseProps extends ResponseXperi{} 
export interface RequestProps extends RequestXperi{}
export interface XperiInstance extends  xperiFrame.Xperi{};
export default xperi;

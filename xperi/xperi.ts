import http, { IncomingMessage, ServerResponse, Server, request }  from 'http';
import { ResponseXperi } from './response/response.js';
import { OptionsFilesProps, Params, RequestXperi } from './request/request.js';
import { GlobalsFeatures } from './globalsFeatures.js';
import { ObjectRouter, XperiRouter } from './xperiRouter/xperiRouter.js';
import url from "url";
import { apllyCors } from './cors/xperiCors.js';

/**
 * This namespace will group all the functionalities of this micro-framework.
 */
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
        cors  = apllyCors;

        /**
         * Create the global features.
         */
        constructor() {
            new GlobalsFeatures();
        }

        /**
         * Specify all the callbacks that should be used.
         * @param {DeclaresTypes.CallbacksProps} callbacks 
         */
        use(...callbacks : DeclaresTypes.CallbacksProps) {
            this.callbacks.push(...callbacks);
        }

        /**
         * It will save the callback to be executed whenever there is an error.
         * @param {DeclaresTypes.CallbackErrorProps} cbConfigError 
         */
        error(cbConfigError : DeclaresTypes.CallbackErrorProps) {
            this.cbConfigError =  cbConfigError;
        }

        /**
         * It is used to specify the server's port, host, and the callback to be executed upon server initialization.
         * @param {number} port
         * @param {CallableFunction} callback
         * @param {string | undefined} [host] - The host on which the server will listen. Optional.
         */
        listen(port : number, callback : () => void, host? : string) {
            this.server = this.createServer();

            this.port = port;
            this.server.listen(port, host, () => {
                callback && callback();
            });
        }

        private createServer() {
            return http.createServer(async (req : IncomingMessage, res : ServerResponse) => {
                const response = new ResponseXperi(res);
                const request  = new RequestXperi(req);
                
                this.implementMiddleware(request, response);
            });
        }

        /**
         * Implement the middlewares by placing them inside a try/catch block.
         * Whenever execution falls into the catch block, the error callback created during server initialization will be executed, receiving the error as a parameter.
         * Next will be the function executed to increment the index. Whenever next is called, the index will increase, so the function to be executed will always be the next one.
         * @param {RequestProps} req - The request object.
         * @param {ResponseProps} res - The response object.
         */
        private async implementMiddleware(req : RequestProps, res : ResponseProps) {
            try {
                await this.setContentRequest(req, res);
                const parsedUrl = url.parse(req.url, true)
                req.setQueryParams(parsedUrl.query);
                
                let index = 0;

                const next = async <T>(params?: T) => {
                   if(index < this.callbacks.length) {
                        try {
                            if(params) {
                                req?.addParams<T>(params)
                            }

                            await this.executeCallback(req, res, next, index++);
                        }catch (error) {
                           this.cbConfigError && await this.cbConfigError(error, req, res);
                        }
                   }
                };

                next();
            } catch(error) {
               this.cbConfigError && await this.cbConfigError(error, req, res);
            }
        }

        /**
         * Executes the callback at the given index and handles routing if the callback is an instance of XperiRouter.
         * @param {RequestProps} request - The request object.
         * @param {ResponseProps} response - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         * @param {number} index - The index of the callback to execute.
         */
        private async executeCallback(request : RequestProps, response : ResponseProps, next : NextFunction, index : number) {
            try {
                if (this.callbacks[index] instanceof XperiRouter) {
                    await this.executeRoutes(request, response, next, index);
                    next();
                    return;
                }
                await this.callbacks[index](request, response, next, this);
            } catch (error) {
               this.cbConfigError && await this.cbConfigError(error, request, response);
            }
        }
        
        /**
         * Executes the routes defined in the XperiRouter instance at the given index.
         * @param {RequestProps} request - The request object.
         * @param {ResponseProps} response - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         * @param {number} index - The index of the XperiRouter instance in the callbacks array.
         */
        private async executeRoutes(request : RequestProps, response : ResponseProps, next : NextFunction, index : number) {
            const fnCallback : ObjectRouter = this.callbacks[index];

            fnCallback.executeRoutes(request, response, this); 
        }

        /**
         * Sets the content of the request based on its content type.
         * @param {RequestProps} request - The request object.
         */
        async setContentRequest(request : RequestProps, response : ResponseProps) {
            if(request.contentType == 'application/json') {
                await request.setBodyJson();
            } 
            else if(request.contentType?.split(';')[0] == 'multipart/form-data') {
                await this.setConfigUploads(request, response);
            }
            else if(request.contentType == 'application/xml')  {
                await request.setBodyXML();
            }    
        }

        /**
         * Configures the upload settings for multipart form-data requests.
         * @param {RequestProps} request - The request object.
         */
        private async setConfigUploads(request : RequestProps, response : ResponseProps) {
            request.setFilesFields(this.fieldsFiles);
            request.setOptionsFiles(this.optionsFiles);

            try{
                await request.processMultipart();
            } catch(error) {
                this.cbConfigError && await this.cbConfigError(error, request, response)
            }
        }
        
        /**
         * Creates a middleware to handle file uploads.
         * * If you want to allow the upload of all files, do not specify any fields.
         * @param {OptionsFiles} options - The options for file uploads.
         * @param {...string[]} fields - The fields to process.
         * @returns {CallableFunction} - The middleware function for handling file uploads.
         */
        upload(options: OptionsFiles, ...fields : string[]) : CallableFunction {
            const objectMultipart = {
                fields, 
                options
            }

            this.setFilesFields(fields);
            this.setOptionsFiles(options);
            return this.middlewareUploaded.bind(objectMultipart);
        }

        /**
         * Sets the fields for file uploads.
         * @param {string[]} [fieldsFiles] - The fields to process.
         */
        setFilesFields(fieldsFiles? : string[]) {
            this.fieldsFiles = fieldsFiles; 
        }

        /**
         * Sets the options for file uploads.
         * @param {OptionsFilesProps} optionsFiles - The options for file uploads.
         */
        setOptionsFiles(optionsFiles : OptionsFilesProps) {
            this.optionsFiles = optionsFiles;
        }

        /**
         * Middleware function for handling file uploads.
         * @param {RequestProps} req - The request object.
         * @param {ResponseProps} _ - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         */
        async middlewareUploaded(this : ObjectMultipart, req : RequestProps, _ : ResponseProps, next : NextFunction) {
            req.setFilesFields(this.fields);
            req.setOptionsFiles(this.options);
            next();
        }

        /**
         * Closes the server.
         */
        close() {
            this.server?.close();
        }

        /**
         * Specify the routes to be used.
         * @param {CallbacksProps} cbRoutes - The callbacks for the routes.
         */
        useRoutes(...cbRoutes : CallbacksProps) {
            this.cbRoutes = cbRoutes;
        }

        /**
         * Method to read files (currently not implemented).
         */
        readFile() {

        }
    }

    export const xperi  = new Xperi();
    export const Router = XperiRouter
}

const xperi = () => xperiFrame.xperi; 
export const Router = () => new xperiFrame.Router;
export default xperi;

export interface ResponseProps extends ResponseXperi{} 
export interface RequestProps extends RequestXperi{}
export interface XperiInstance extends  xperiFrame.Xperi{};

export type NextFunction       = DeclaresTypes.NextFunction ;
export type ErrorHandler       = DeclaresTypes.ErrorHandler;
export type CallbacksProps     = DeclaresTypes.CallbacksProps;
export type CallbackErrorProps = DeclaresTypes.CallbackErrorProps;
export type OptionsFiles       = OptionsFilesProps;
export type ObjectMultipart    = DeclaresTypes.ObjectMultipart;

export namespace DeclaresTypes {
    export type NextFunction       = <T>(params?: T) => void;
    export type ErrorHandler       = Error | undefined;
    export type CallbacksProps     = ((req? : RequestProps, res? : ResponseProps, next? : NextFunction, server?: XperiInstance) => Promise<any>)[] | any[];
    export type CallbackErrorProps = ((error : unknown, req : RequestProps, res : ResponseProps) => Promise<void | object>);
    export type ObjectMultipart    = {fields : string[], options : OptionsFiles};
}

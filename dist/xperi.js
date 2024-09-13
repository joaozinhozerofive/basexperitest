import http from 'http';
import { ResponseXperi } from './response/response.js';
import { RequestXperi } from './request/request.js';
import { GlobalsFeatures } from './globalsFeatures.js';
import { XperiRouter } from './xperiRouter/xperiRouter.js';
import url from "url";
import { apllyCors } from './cors/xperiCors.js';
/**
 * This namespace will group all the functionalities of this micro-framework.
 */
export var xperiFrame;
(function (xperiFrame) {
    class Xperi {
        server = null;
        port = null;
        useJson = false;
        callbacks = [];
        cbConfigError = async () => { };
        optionsFiles = { keepExtensions: true };
        fieldsFiles = [];
        cbRoutes = [];
        cors = apllyCors;
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
        use(...callbacks) {
            this.callbacks.push(...callbacks);
        }
        /**
         * It will save the callback to be executed whenever there is an error.
         * @param {DeclaresTypes.CallbackErrorProps} cbConfigError
         */
        error(cbConfigError) {
            this.cbConfigError = cbConfigError;
        }
        /**
         * It is used to specify the server's port, host, and the callback to be executed upon server initialization.
         * @param {number} port
         * @param {CallableFunction} callback
         * @param {string | undefined} [host] - The host on which the server will listen. Optional.
         */
        listen(port, callback, host) {
            this.server = this.createServer();
            this.port = port;
            this.server.listen(port, host, () => {
                callback && callback();
            });
        }
        createServer() {
            return http.createServer(async (req, res) => {
                const response = new ResponseXperi(res);
                const request = new RequestXperi(req);
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
        async implementMiddleware(req, res) {
            try {
                await this.setContentRequest(req, res);
                const parsedUrl = url.parse(req.url, true);
                req.setQueryParams(parsedUrl.query);
                let index = 0;
                const next = async (params) => {
                    if (index < this.callbacks.length) {
                        try {
                            if (params) {
                                req?.addParams(params);
                            }
                            await this.executeCallback(req, res, next, index++);
                        }
                        catch (error) {
                            this.cbConfigError && await this.cbConfigError(error, req, res);
                        }
                    }
                };
                next();
            }
            catch (error) {
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
        async executeCallback(request, response, next, index) {
            try {
                if (this.callbacks[index] instanceof XperiRouter) {
                    await this.executeRoutes(request, response, next, index);
                    next();
                    return;
                }
                await this.callbacks[index](request, response, next, this);
            }
            catch (error) {
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
        async executeRoutes(request, response, next, index) {
            const fnCallback = this.callbacks[index];
            fnCallback.executeRoutes(request, response, this);
        }
        /**
         * Sets the content of the request based on its content type.
         * @param {RequestProps} request - The request object.
         */
        async setContentRequest(request, response) {
            if (request.contentType == 'application/json') {
                await request.setBodyJson();
            }
            else if (request.contentType?.split(';')[0] == 'multipart/form-data') {
                await this.setConfigUploads(request, response);
            }
            else if (request.contentType == 'application/xml') {
                await request.setBodyXML();
            }
        }
        /**
         * Configures the upload settings for multipart form-data requests.
         * @param {RequestProps} request - The request object.
         */
        async setConfigUploads(request, response) {
            request.setFilesFields(this.fieldsFiles);
            request.setOptionsFiles(this.optionsFiles);
            try {
                await request.processMultipart();
            }
            catch (error) {
                this.cbConfigError && await this.cbConfigError(error, request, response);
            }
        }
        /**
         * Creates a middleware to handle file uploads.
         * * If you want to allow the upload of all files, do not specify any fields.
         * @param {OptionsFiles} options - The options for file uploads.
         * @param {...string[]} fields - The fields to process.
         * @returns {CallableFunction} - The middleware function for handling file uploads.
         */
        upload(options, ...fields) {
            const objectMultipart = {
                fields,
                options
            };
            this.setFilesFields(fields);
            this.setOptionsFiles(options);
            return this.middlewareUploaded.bind(objectMultipart);
        }
        /**
         * Sets the fields for file uploads.
         * @param {string[]} [fieldsFiles] - The fields to process.
         */
        setFilesFields(fieldsFiles) {
            this.fieldsFiles = fieldsFiles;
        }
        /**
         * Sets the options for file uploads.
         * @param {OptionsFilesProps} optionsFiles - The options for file uploads.
         */
        setOptionsFiles(optionsFiles) {
            this.optionsFiles = optionsFiles;
        }
        /**
         * Middleware function for handling file uploads.
         * @param {RequestProps} req - The request object.
         * @param {ResponseProps} _ - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         */
        async middlewareUploaded(req, _, next) {
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
        useRoutes(...cbRoutes) {
            this.cbRoutes = cbRoutes;
        }
        /**
         * Method to read files (currently not implemented).
         */
        readFile() {
        }
    }
    xperiFrame.Xperi = Xperi;
    xperiFrame.xperi = new Xperi();
    xperiFrame.Router = XperiRouter;
})(xperiFrame || (xperiFrame = {}));
const xperi = () => xperiFrame.xperi;
export const Router = () => new xperiFrame.Router;
export default xperi;
;

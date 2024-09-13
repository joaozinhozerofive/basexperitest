import { ResponseXperi } from './response/response.js';
import { OptionsFilesProps, RequestXperi } from './request/request.js';
import { XperiRouter } from './xperiRouter/xperiRouter.js';
/**
 * This namespace will group all the functionalities of this micro-framework.
 */
export declare namespace xperiFrame {
    class Xperi {
        private server;
        private port;
        useJson: boolean;
        private callbacks;
        cbConfigError: DeclaresTypes.CallbackErrorProps;
        optionsFiles: OptionsFilesProps;
        fieldsFiles: string[] | undefined;
        cbRoutes: CallbacksProps;
        cors: (options: import("./cors/xperiCors.js").CorsProps) => (req: RequestProps, res: ResponseProps, next: NextFunction) => void;
        /**
         * Create the global features.
         */
        constructor();
        /**
         * Specify all the callbacks that should be used.
         * @param {DeclaresTypes.CallbacksProps} callbacks
         */
        use(...callbacks: DeclaresTypes.CallbacksProps): void;
        /**
         * It will save the callback to be executed whenever there is an error.
         * @param {DeclaresTypes.CallbackErrorProps} cbConfigError
         */
        error(cbConfigError: DeclaresTypes.CallbackErrorProps): void;
        /**
         * It is used to specify the server's port, host, and the callback to be executed upon server initialization.
         * @param {number} port
         * @param {CallableFunction} callback
         * @param {string | undefined} [host] - The host on which the server will listen. Optional.
         */
        listen(port: number, callback: () => void, host?: string): void;
        private createServer;
        /**
         * Implement the middlewares by placing them inside a try/catch block.
         * Whenever execution falls into the catch block, the error callback created during server initialization will be executed, receiving the error as a parameter.
         * Next will be the function executed to increment the index. Whenever next is called, the index will increase, so the function to be executed will always be the next one.
         * @param {RequestProps} req - The request object.
         * @param {ResponseProps} res - The response object.
         */
        private implementMiddleware;
        /**
         * Executes the callback at the given index and handles routing if the callback is an instance of XperiRouter.
         * @param {RequestProps} request - The request object.
         * @param {ResponseProps} response - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         * @param {number} index - The index of the callback to execute.
         */
        private executeCallback;
        /**
         * Executes the routes defined in the XperiRouter instance at the given index.
         * @param {RequestProps} request - The request object.
         * @param {ResponseProps} response - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         * @param {number} index - The index of the XperiRouter instance in the callbacks array.
         */
        private executeRoutes;
        /**
         * Sets the content of the request based on its content type.
         * @param {RequestProps} request - The request object.
         */
        setContentRequest(request: RequestProps, response: ResponseProps): Promise<void>;
        /**
         * Configures the upload settings for multipart form-data requests.
         * @param {RequestProps} request - The request object.
         */
        private setConfigUploads;
        /**
         * Creates a middleware to handle file uploads.
         * * If you want to allow the upload of all files, do not specify any fields.
         * @param {OptionsFiles} options - The options for file uploads.
         * @param {...string[]} fields - The fields to process.
         * @returns {CallableFunction} - The middleware function for handling file uploads.
         */
        upload(options: OptionsFiles, ...fields: string[]): CallableFunction;
        /**
         * Sets the fields for file uploads.
         * @param {string[]} [fieldsFiles] - The fields to process.
         */
        setFilesFields(fieldsFiles?: string[]): void;
        /**
         * Sets the options for file uploads.
         * @param {OptionsFilesProps} optionsFiles - The options for file uploads.
         */
        setOptionsFiles(optionsFiles: OptionsFilesProps): void;
        /**
         * Middleware function for handling file uploads.
         * @param {RequestProps} req - The request object.
         * @param {ResponseProps} _ - The response object.
         * @param {NextFunction} next - The function to call the next middleware.
         */
        middlewareUploaded(this: ObjectMultipart, req: RequestProps, _: ResponseProps, next: NextFunction): Promise<void>;
        /**
         * Closes the server.
         */
        close(): void;
        /**
         * Specify the routes to be used.
         * @param {CallbacksProps} cbRoutes - The callbacks for the routes.
         */
        useRoutes(...cbRoutes: CallbacksProps): void;
        /**
         * Method to read files (currently not implemented).
         */
        readFile(): void;
    }
    const xperi: Xperi;
    const Router: typeof XperiRouter;
}
declare const xperi: () => xperiFrame.Xperi;
export declare const Router: () => XperiRouter;
export default xperi;
export interface ResponseProps extends ResponseXperi {
}
export interface RequestProps extends RequestXperi {
}
export interface XperiInstance extends xperiFrame.Xperi {
}
export type NextFunction = DeclaresTypes.NextFunction;
export type ErrorHandler = DeclaresTypes.ErrorHandler;
export type CallbacksProps = DeclaresTypes.CallbacksProps;
export type CallbackErrorProps = DeclaresTypes.CallbackErrorProps;
export type OptionsFiles = OptionsFilesProps;
export type ObjectMultipart = DeclaresTypes.ObjectMultipart;
export declare namespace DeclaresTypes {
    type NextFunction = <T>(params?: T) => void;
    type ErrorHandler = Error | undefined;
    type CallbacksProps = ((req?: RequestProps, res?: ResponseProps, next?: NextFunction, server?: XperiInstance) => Promise<any>)[] | any[];
    type CallbackErrorProps = ((error: unknown, req: RequestProps, res: ResponseProps) => Promise<void | object>);
    type ObjectMultipart = {
        fields: string[];
        options: OptionsFiles;
    };
}

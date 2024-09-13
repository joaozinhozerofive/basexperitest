import { CallbacksProps, RequestProps, ResponseProps, XperiInstance } from "../xperi.js";
/**
 * "Interface created to group the types of a created route."
 */
interface Routes {
    path: string;
    originalPath: string;
    method?: string;
    alternativeRoutes?: Routes[];
    callbacks?: CallbacksProps;
}
/**
 * This class obtains all the functionalities of the route manager.
 */
export declare class XperiRouter {
    private routes;
    private res;
    private req;
    private server;
    /**
     * This method will create the route and its callbacks, as well as its external routes, which are also created by this class
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    use(path: string, ...callbacks: CallbacksProps): void;
    /**
     * This method is used to execute all the routes; this is where all validations and middleware executions are performed.
     * @param {RequestProps} req
     * @param {ResponseProps} res
     * @param {XperiInstance} server
     */
    executeRoutes(req: RequestProps, res: ResponseProps, server: XperiInstance): void;
    /**
     * Adds the parameters sent in the URL as a JSON object.
     * @param {Routes} routeMatched
     */
    private setRequestParamsRegex;
    /**
     * Validate if the main route and the alternative route (created by any get, post, delete, patch, or put method) are valid routes when compared to the request URL.
     * @param route
     * @returns
     */
    private isValidRoute;
    /**
     * Return only the valid alternative routes (those with a set path).
     * @param {Routes[]} alternativeRoutes
     * @returns {Routes[]}
     */
    private getValidAlternativeRoute;
    /**
     * Return an alternative route that matches the URL.
     * @param {string} routePath
     * @param {Routes[]} newAlternativeRoutes
     * @returns {Routes | undefined}
     */
    private getAlternativeRouteCompatibleWithUrl;
    /**
     * Validate the URL path against the defined route path.
     * * Make the handling of trailing slashes in each path more flexible for validation, without compromising security.
     * @param {string} fullPath
     * @param {string} pathUrl
     * @returns {boolean}
     */
    private isValidPath;
    /**
     * Set the response object.
     * @param {ResponseProps} res
     */
    private setResponse;
    /**
     * Set the request object.
     * @param {RequestProps} req
     */
    private setRequest;
    /**
     * Set the instance of server.
     * @param {XperiInstance} server
     */
    private setServer;
    /**
     * Implement the middlewares by placing them inside a try/catch block.
     * Whenever execution falls into the catch block, the error callback created during server initialization will be executed, receiving the error as a parameter.
     * Next will be the function executed to increment the index. Whenever next is called, the index will increase, so the function to be executed will always be the next one.
     * @param callbacks
     * @param route
     */
    private implementMiddleware;
    /**
     * This method is responsible for executing the callbacks, and if the provided callback is actually a Router object, it will need to be executed differently
     * @param {CallbacksProps} callbacks
     * @param {number} index
     * @param {NextFunction} next
     * @param {Routes} route
     * @returns {Promise<void>}
     */
    private executeCallback;
    /**
     * It will execute the route that does not belong to this instance but is in the middleware execution queue. External routes will also be referred to as alternative routes.
     * @param {Routes} route
     */
    executeExternalInstanceRouter(route: Routes): Promise<void>;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    get(path: string, ...callbacks: CallbacksProps): void;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    post(path: string, ...callbacks: CallbacksProps): void;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    patch(path: string, ...callbacks: CallbacksProps): void;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    put(path: string, ...callbacks: CallbacksProps): void;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    delete(path: string, ...callbacks: CallbacksProps): void;
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    options(path: string, ...callbacks: CallbacksProps): void;
}
export interface ObjectRouter extends XperiRouter {
}
export {};

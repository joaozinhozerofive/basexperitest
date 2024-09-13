import { buildRoute } from "./build-route.js";
/**
 * This class obtains all the functionalities of the route manager.
 */
export class XperiRouter {
    routes = [];
    res = null;
    req = null;
    server = null;
    /**
     * This method will create the route and its callbacks, as well as its external routes, which are also created by this class
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    use(path, ...callbacks) {
        const callbacksInstanceofRouter = callbacks.filter(cb => cb instanceof XperiRouter);
        const alternativeRoutes = callbacksInstanceofRouter.map(cb => cb.routes);
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            alternativeRoutes: alternativeRoutes[0],
            callbacks
        });
    }
    /**
     * This method is used to execute all the routes; this is where all validations and middleware executions are performed.
     * @param {RequestProps} req
     * @param {ResponseProps} res
     * @param {XperiInstance} server
     */
    executeRoutes(req, res, server) {
        this.setRequest(req);
        this.setResponse(res);
        this.setServer(server);
        const routeMatched = this.routes.find(route => this.isValidRoute(route));
        if (routeMatched && routeMatched.callbacks) {
            this.setRequestParamsRegex(routeMatched);
            this.implementMiddleware(routeMatched.callbacks, routeMatched);
        }
        else {
            res.status(404);
            res.$.end(`Route '${this.req?.url}' and method '${this.req?.method}' not found`);
        }
    }
    /**
     * Adds the parameters sent in the URL as a JSON object.
     * @param {Routes} routeMatched
     */
    setRequestParamsRegex(routeMatched, prevRoute) {
        const routeParametersRegex = /:([A-Za-z\-_]+)/g;
        const routeWithParams = routeMatched.originalPath.replaceAll(routeParametersRegex, '(?<$1>[a-zA-Z0-9\\-_]+)');
        const routeRegex = prevRoute ? new RegExp(`${prevRoute}${routeWithParams}`) : new RegExp(routeWithParams);
        const urlParams = { ...this.req?.url.match(routeRegex)?.groups };
        this.req?.addParams(urlParams);
    }
    /**
     * Validate if the main route and the alternative route (created by any get, post, delete, patch, or put method) are valid routes when compared to the request URL.
     * @param route
     * @returns
     */
    isValidRoute(route) {
        if (!route) {
            return;
        }
        const { path: routePath } = route;
        const { alternativeRoutes } = route;
        const newAlternativeRoutes = this.getValidAlternativeRoute(alternativeRoutes);
        if (!newAlternativeRoutes?.length) {
            return this.isValidPath(routePath, this.req?.url);
        }
        const alternativeRouteCompatibleWithUrlRoute = this.getAlternativeRouteCompatibleWithUrl(routePath, newAlternativeRoutes);
        if (alternativeRouteCompatibleWithUrlRoute) {
            this.setRequestParamsRegex(alternativeRouteCompatibleWithUrlRoute, routePath);
            return true;
        }
        return false;
    }
    /**
     * Return only the valid alternative routes (those with a set path).
     * @param {Routes[]} alternativeRoutes
     * @returns {Routes[]}
     */
    getValidAlternativeRoute(alternativeRoutes) {
        return alternativeRoutes && alternativeRoutes.filter(alternativeRoute => {
            return alternativeRoute?.path;
        });
    }
    /**
     * Return an alternative route that matches the URL.
     * @param {string} routePath
     * @param {Routes[]} newAlternativeRoutes
     * @returns {Routes | undefined}
     */
    getAlternativeRouteCompatibleWithUrl(routePath, newAlternativeRoutes) {
        return newAlternativeRoutes.find(alternativeRoute => {
            const fullPath = `${routePath}${alternativeRoute.path}`;
            return this.isValidPath(fullPath, this.req?.url) && this.req?.method === alternativeRoute?.method;
        });
    }
    /**
     * Validate the URL path against the defined route path.
     * * Make the handling of trailing slashes in each path more flexible for validation, without compromising security.
     * @param {string} fullPath
     * @param {string} pathUrl
     * @returns {boolean}
     */
    isValidPath(fullPath, pathUrl) {
        [pathUrl] = pathUrl.split("?");
        const fullPathRegex = new RegExp(`^${fullPath}$`);
        const fullPathRegexWithSlash = new RegExp(`^${fullPath}/$`);
        const pathUrlWithSlash = `${pathUrl}/`;
        return (fullPathRegex.test(pathUrlWithSlash) || fullPathRegex.test(pathUrl)) || fullPathRegexWithSlash.test(pathUrl);
    }
    /**
     * Set the response object.
     * @param {ResponseProps} res
     */
    setResponse(res) {
        this.res = res;
    }
    /**
     * Set the request object.
     * @param {RequestProps} req
     */
    setRequest(req) {
        this.req = req;
    }
    /**
     * Set the instance of server.
     * @param {XperiInstance} server
     */
    setServer(server) {
        this.server = server;
    }
    /**
     * Implement the middlewares by placing them inside a try/catch block.
     * Whenever execution falls into the catch block, the error callback created during server initialization will be executed, receiving the error as a parameter.
     * Next will be the function executed to increment the index. Whenever next is called, the index will increase, so the function to be executed will always be the next one.
     * @param callbacks
     * @param route
     */
    async implementMiddleware(callbacks, route) {
        let index = 0;
        const next = async (params) => {
            if (index < callbacks.length) {
                try {
                    if (params) {
                        this.req?.addParams(params);
                    }
                    await this.executeCallback(callbacks, index++, next, route);
                }
                catch (error) {
                    this.server?.cbConfigError && await this.server?.cbConfigError(error, this.req, this.res);
                }
            }
        };
        next();
    }
    /**
     * This method is responsible for executing the callbacks, and if the provided callback is actually a Router object, it will need to be executed differently
     * @param {CallbacksProps} callbacks
     * @param {number} index
     * @param {NextFunction} next
     * @param {Routes} route
     * @returns {Promise<void>}
     */
    async executeCallback(callbacks, index, next, route) {
        try {
            if (callbacks[index] instanceof XperiRouter) {
                this.executeExternalInstanceRouter(route);
                return;
            }
            await callbacks[index](this.req, this.res, next, this.server);
        }
        catch (error) {
            await this.server?.cbConfigError(error, this.req, this.res);
        }
    }
    /**
     * It will execute the route that does not belong to this instance but is in the middleware execution queue. External routes will also be referred to as alternative routes.
     * @param {Routes} route
     */
    async executeExternalInstanceRouter(route) {
        try {
            const alternativeRouteMatched = route?.alternativeRoutes?.find(alternativeRoute => {
                const fullPath = `${route.path}${alternativeRoute.path}`;
                return this.isValidPath(fullPath, this.req?.url) && this.req?.method === alternativeRoute?.method;
            });
            if (alternativeRouteMatched?.callbacks) {
                this.implementMiddleware(alternativeRouteMatched.callbacks, alternativeRouteMatched);
            }
        }
        catch (error) {
            await this.server?.cbConfigError(error, this.req, this.res);
        }
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    get(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'GET'
        });
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    post(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'POST'
        });
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    patch(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'PATCH'
        });
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    put(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'PUT'
        });
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    delete(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'DELETE'
        });
    }
    /**
     * All callbacks set here will only be executed if the URL and the request method match this method and this path
     * @param {string} path
     * @param {CallbacksProps} callbacks
     */
    options(path, ...callbacks) {
        this.routes.push({
            path: buildRoute(path),
            originalPath: path,
            callbacks,
            method: 'OPTIONS'
        });
    }
}
;

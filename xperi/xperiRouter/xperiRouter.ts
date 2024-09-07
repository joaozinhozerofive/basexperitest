import { CallbacksProps, NextFunction, RequestProps, ResponseProps, Router, XperiInstance } from "../xperi.js";
import { buildRoute } from "./build-route.js";

interface Routes{
    path :  string,
    originalPath :  string,
    method?: string     
    alternativeRoutes?: Routes[]
    callbacks? : CallbacksProps;
}

export class XperiRouter{
    private routes : Routes[] = [];
    private mainRoute : string = '';
    private res    : ResponseProps | null = null;
    private req    : RequestProps  | null = null;
    private server : XperiInstance | null = null;
    private prevRoute : string = '';

    use(path: string, ...callbacks : CallbacksProps) {
        const callbacksInstanceofRouter  = callbacks.filter(cb => cb instanceof XperiRouter);
        const alternativeRoutes = callbacksInstanceofRouter.map(cb => cb.routes);

        this.routes.push({ 
            path : buildRoute(path),
            originalPath : path,
            alternativeRoutes : alternativeRoutes[0],
            callbacks
        });
    }

    executeRoutes(req : RequestProps, res : ResponseProps, server : XperiInstance, prevRoute? : string){
        this.setRequest(req);
        this.setResponse(res);
        this.setServer(server);

        const routeMatched = this.routes.find(route => this.isValidRouteByPrevRouteAndNewRoute(route));

        if(routeMatched && routeMatched.callbacks) {
            this.setRequestParamsRegex(routeMatched as Routes);
            this.setMainRoute(routeMatched.path as string);
            this.implementMiddleware(routeMatched.callbacks, routeMatched);
        } else {
            res.status(404);
            res.$.end(`Route '${this.req?.url}' and method '${this.req?.method}' not found`);
        }
    }

    private setRequestParamsRegex(routeMatched : Routes) {
        const routeParametersRegex = /:([A-Za-z\-_]+)/g; 
        const routeWithParams = routeMatched.originalPath.replaceAll(routeParametersRegex, '(?<$1>[a-zA-Z0-9\\-_]+)');
        const routeRegex = new RegExp(routeWithParams);
        const urlParams  = {...this.req?.url.match(routeRegex)?.groups}
        this.req?.setUrlParams(urlParams);
    }

     private isValidRouteByPrevRouteAndNewRoute(route? : Routes) {
        if(!route) {
            return;
        }

        const { path : routePath }  = route;
        const { alternativeRoutes } = route;

        const newAlternativeRoutes = this.getValidAlternativeRoute(alternativeRoutes as Routes[]);

        if(!newAlternativeRoutes?.length ) {
            const pathRegex = new RegExp(`^${routePath}$`);
            return pathRegex.test(this.req?.url as string);
        }

        const alternativeRouteCompatibleWithUrlRoute = this.getAlternativeRouteCompatibleWithUrl(routePath, newAlternativeRoutes)
        
        if(alternativeRouteCompatibleWithUrlRoute) {
            this.setRequestParamsRegex(alternativeRouteCompatibleWithUrlRoute)

            return true;
        }

        return false;
    }

    private getValidAlternativeRoute(alternativeRoutes : Routes[]) {
        return alternativeRoutes && alternativeRoutes.filter(alternativeRoute => {
            return alternativeRoute?.path;
        })
    }

    private getAlternativeRouteCompatibleWithUrl(routePath : string, newAlternativeRoutes : Routes[]){
        return newAlternativeRoutes.find(alternativeRoute => {
            const fullPathRegex = new RegExp(`^${routePath}${alternativeRoute.path}$`);
            return fullPathRegex.test(this.req?.url as string) && this.req?.method === alternativeRoute?.method
        })
    }

    private setResponse(res : ResponseProps) {
        this.res = res;
    }

    private setRequest(req : RequestProps) {
        this.req = req;
    }

    private setServer(server : XperiInstance) {
        this.server = server;
    }

    private setMainRoute(route : string) {
        this.mainRoute = route;
    }

    private async implementMiddleware(callbacks: CallbacksProps, route :Routes) {
        let index = 0;
        const next = async () => {
            if(index < callbacks.length) {
                try {
                    await this.executeCallback(callbacks, index++, next, route);
                }catch (error) {
                    await this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps)
                }
           }
        };

        next();
    }

    private async executeCallback(callbacks : CallbacksProps, index : number, next : NextFunction, route : Routes) {
        try {
            if(callbacks[index] instanceof XperiRouter) {
                this.executeExternalInstanceRouter(callbacks[index], index, route);
                return;
            }

            await callbacks[index](this.req, this.res, next, this.server);
        } catch(error) {
            await this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps);
        }
    }

    async executeExternalInstanceRouter(xperiRouter : XperiRouter, index : number, route : Routes) {
        try {
            const alternativeRouteMatched = route?.alternativeRoutes?.find(alternativeRoute => {
                const fullPathRegex = new RegExp(`^${route.path}${alternativeRoute.path}$`);
                return fullPathRegex.test(this.req?.url as string) && this.req?.method === alternativeRoute?.method
            })

            if(alternativeRouteMatched?.callbacks) {
                this.implementMiddleware(alternativeRouteMatched.callbacks, alternativeRouteMatched);
            }

        } catch(error) {
            await this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps);
        }
    }
    
    async executeExternalCallbackInstanceRouter(req : RequestProps, res : ResponseProps, server : XperiInstance, route : string) {
        try {
            this.executeRoutes(req, res, server, route);
        } catch(error) {
            await server.cbConfigError(error, req, res);
        }
    }

    get(path: string, ...callbacks : CallbacksProps) {
        this.routes.push({ 
            path : buildRoute(path),
            originalPath : path, 
            callbacks, 
            method: 'GET' 
        });
    }

    post(path: string, ...callbacks : CallbacksProps) {
        this.routes.push({ 
            path : buildRoute(path),
            originalPath : path, 
            callbacks, 
            method: 'POST' });
    }

    patch(path: string, ...callbacks : CallbacksProps) {
        this.routes.push({ 
            path : buildRoute(path), 
            originalPath : path, 
            callbacks, 
            method: 'PATCH' });
    }

    put(path: string, ...callbacks : CallbacksProps) {
        this.routes.push({ 
            path : buildRoute(path),
            originalPath : path, 
            callbacks, 
            method: 'PUT' });
    }

    delete(path: string, ...callbacks : CallbacksProps) {
        this.routes.push({ 
            path : buildRoute(path),
            originalPath : path, 
            callbacks, 
            method: 'DELETE' 
        });
    }
}

export interface ObjectRouter extends XperiRouter{};
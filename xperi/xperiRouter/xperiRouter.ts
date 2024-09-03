import { CallbacksProps, NextFunction, RequestProps, ResponseProps, Router, XperiInstance } from "../xperi.js";
import { buildRoute } from "./build-route.js";

interface Routes{
    path :  string,
    originalPath :  string,
    callbacks : CallbacksProps, 
    method?: string     
}

export namespace UseRouterXperi {
    export class XperiRouter{
        routes : Routes[] = [];
        mainRoute : string = '';
        res    : ResponseProps | null = null;
        req    : RequestProps  | null = null;
        server : XperiInstance | null = null;
        prevRoute : string = '';

        use(path: string, ...callbacks : CallbacksProps) {
            this.routes.push({ 
                path : buildRoute(path),
                originalPath : path,
                callbacks 
            });
        }

        executeRoutes(req : RequestProps, res : ResponseProps, server : XperiInstance, prevRoute? : string){
            this.setRequest(req);
            this.setResponse(res);
            this.setServer(server);

            const routes = this.routes.map(newRoute => {
                return this.getRouteWithCallbacks(newRoute.path, newRoute, prevRoute)
            });

            const routeMatched = routes.find(newRoute => {
                return this.isValidRouteByPrevRouteAndNewRoute(newRoute as Routes, prevRoute as string);
            });
         
            if(routeMatched) {
                this.setRequestParamsRegex(routeMatched);
                this.setMainRoute(routeMatched.path);
                this.implementMiddleware(routeMatched.callbacks);
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
        }

        private isValidRouteByPrevRouteAndNewRoute(newRoute : Routes, prevRoute : string) {
            let urlRoute  = this.getArrayWithoutSpace(this.req?.$.url?.split('/') || []).join("/");
            let thisRoute = this.getArrayWithoutSpace(newRoute?.path.split("/")  || []).join("/");
            const thisRouteRegex = new RegExp(thisRoute);
            let alternativeRoute = urlRoute.replace(thisRouteRegex, "");
            const fullRouteRegex = new RegExp(`${newRoute?.path}${alternativeRoute}`);
            const fullExternalRoute = new RegExp(`${prevRoute}/${thisRoute}`);

            return (alternativeRoute ? fullRouteRegex.test(`/${urlRoute}`): true) || (fullExternalRoute.test(`/${urlRoute}`) && newRoute?.method === this.req?.method);
        }

        private getDefaultObjectRoute(route : string) {
            let urlRoute         = this.getArrayWithoutSpace(this.req?.$.url?.split('/') || []).join("/");
            let thisRoute        = this.getArrayWithoutSpace(route.split("/")).join("/");
            const routeRegex     = new RegExp(thisRoute);
            let alternativeRoute = urlRoute.replace(routeRegex, ""); 

            return {
                urlRoute, 
                thisRoute, 
                alternativeRoute
            }
        }

        private getAlternativeRouteFiltered(objectRouter : Routes, alternativeRoute : string) {
            return objectRouter.callbacks
            .map(cb => this.getMatchRoutesByCallbackObjectRouter(cb, alternativeRoute))
            .find(element => element);
        }

        private getRouteWithCallbacks(route : string, objectRouter : Routes, prevRoute? : string){
            const { urlRoute, thisRoute, alternativeRoute } = this.getDefaultObjectRoute(route);
            const alternativeRouteFiltered = this.getAlternativeRouteFiltered(objectRouter, alternativeRoute);
            return this.getObjectRouterByTypeRoute(alternativeRouteFiltered, prevRoute as string, urlRoute, thisRoute, objectRouter)
        }

        private getObjectRouterByTypeRoute(alternativeRouteFiltered : Routes, prevRoute : string, urlRoute : string, thisRoute : string, objectRouter : Routes) {
            const newAlternativeRoute = alternativeRouteFiltered?.path;
            const externalRoute       = prevRoute ? `${prevRoute}/${thisRoute}` : ""
            const urlRouteFormatted   = urlRoute;
            
            if(externalRoute) {
                const isValidRoute = 
                this.getOrConditionals(`/${urlRouteFormatted}` == externalRoute, `${urlRouteFormatted}/` == externalRoute, `/${urlRouteFormatted}/` == externalRoute, `${urlRouteFormatted}` == externalRoute); 

                const newObjectRouter = this.routes.find(newRoute => {
                    const newRouteMethod  = newRoute?.method
                    const prevAndNewRoute = `${prevRoute}${newRoute.path}`
                    const requestMethod   = this.req?.method
                    return prevAndNewRoute === `/${urlRouteFormatted}` && (newRouteMethod ? (newRouteMethod === requestMethod) : true)
                })
                if(isValidRoute) {
                    return newObjectRouter
                }
            }

            const routeRegex     = new RegExp(`${thisRoute}${newAlternativeRoute ?? ""}`);
            const matchedRoutes  = routeRegex.test(urlRoute)
            const matchedMethods = alternativeRouteFiltered?.method ? (alternativeRouteFiltered?.method === this.req?.method) : true;
            
            if(matchedRoutes && matchedMethods) {
                return objectRouter;  
            }
        }

        private getOrConditionals(...conditionals : boolean[]) {
            let someConditionalIsTrue : boolean = false;
            for(const conditional of conditionals) {
                if(conditional === true) {
                    someConditionalIsTrue = conditional;
                    break;
                }
            }

            return someConditionalIsTrue;
        }

        private getMatchRoutesByCallbackObjectRouter(cb : any, alternativeRoute : string) {
            return cb.routes?.find((newRoute : Routes) => {
                return newRoute.path === alternativeRoute && (newRoute.method ? (this.req?.method === newRoute.method) : true)
            });
        }

        private getArrayWithoutSpace(array : string[]) {
            let newArray = [];
            for(const element of array) {
                if(element) {
                    const [elementFormatted] = element.split("?");
                    newArray.push(elementFormatted);
                }
            }

            return newArray;
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

        private async implementMiddleware(callbacks: CallbacksProps) {
            let nextFunction = false;
            const next = () => {
                nextFunction = true;
            };

            for (let i = 0; i < callbacks.length; i++) {
                if (nextFunction || i === 0) {
                    nextFunction = false;
                    try {
                        await this.executeCallback(callbacks, i, next);
                    } catch (error) {
                        await this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps)
                    }
                }
            }
        }

        private async executeCallback(callbacks : CallbacksProps, index : number, next : NextFunction) {
            try {
                if(callbacks[index] instanceof UseRouterXperi.XperiRouter) {
                    this.executeExternalInstanceRouter(callbacks, index);
                    return;
                }
    
                await callbacks[index](this.req, this.res, next, this.server);
            } catch(error) {
                await this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps);
            }
        }

        async executeExternalInstanceRouter(callbacks : CallbacksProps, index : number) {
            try {
                const fnCallback : ObjectRouter = callbacks[index];
                const newCallback = fnCallback.executeExternalCallbackInstanceRouter.bind(fnCallback);
                newCallback(this.req as RequestProps, this.res as ResponseProps, this.server as XperiInstance, this.mainRoute);
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
                method: 'DELETE' });
        }
    }
}

export interface ObjectRouter extends UseRouterXperi.XperiRouter{};
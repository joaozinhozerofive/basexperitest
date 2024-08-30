import { CallbacksProps, NextFunction, RequestProps, ResponseProps, Router, XperiInstance } from "../xperi.js";

interface Routes{
    route :  string,
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

        use(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks });
        }

        executeRoutes(req : RequestProps, res : ResponseProps, server : XperiInstance, prevRoute? : string){
            this.setRequest(req);
            this.setResponse(res);
            this.setServer(server);

            const routes = this.routes.map(newRoute => {
                return this.getRouteWithCallbacks(newRoute.route, newRoute, prevRoute)
            });

            const routeMatched = routes.find(newRoute => {
                return this.isValidRouteByPrevRouteAndNewRoute(newRoute as Routes, prevRoute as string);
            });

            if(routeMatched) {
                this.setMainRoute(routeMatched.route);
                this.implementMiddleware(routeMatched.callbacks);
            } else {
                res.$.end('Route not found');
            }
        }

        private buildRoute() {

        }

        private isValidRouteByPrevRouteAndNewRoute(newRoute : Routes, prevRoute : string) {
            let urlRoute  = this.getArrayWithoutSpace(this.req?.$.url?.split('/') || []);
            let thisRoute = this.getArrayWithoutSpace(newRoute?.route.split("/")  || []);
            let alternativeRoute = urlRoute.join("/").replace(thisRoute.join("/"), "");

            return `${newRoute?.route}${alternativeRoute}` === `/${urlRoute.join("/")}` || `${prevRoute}/${thisRoute}` == `/${urlRoute.join("/")}`
        }

        private getDefaultObjectRoute(route : string) {
            let urlRoute         = this.getArrayWithoutSpace(this.req?.$.url?.split('/') || []);
            let thisRoute        = this.getArrayWithoutSpace(route.split("/"));
            let alternativeRoute = urlRoute.join("/").replace(thisRoute.join("/"), ""); 

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

        private getObjectRouterByTypeRoute(alternativeRouteFiltered : Routes, prevRoute : string, urlRoute : string[], thisRoute : string[], objectRouter : Routes) {
            const newAlternativeRoute = alternativeRouteFiltered?.route;
            const externalRoute       = prevRoute ? `${prevRoute}/${thisRoute.join("/")}` : ""
            const urlRouteFormatted   = urlRoute.join("/");

            if(externalRoute) {
                const isValidRoute = 
                this.getOrConditionals(`/${urlRouteFormatted}` == externalRoute, `${urlRouteFormatted}/` == externalRoute, `/${urlRouteFormatted}/` == externalRoute, `${urlRouteFormatted}` == externalRoute); 

                const newObjectRouter = this.routes.find(newRoute => {
                    const newRouteMethod  = newRoute?.method
                    const prevAndNewRoute = `${prevRoute}${newRoute.route}`
                    const requestMethod   = this.req?.method

                    return prevAndNewRoute === `/${urlRouteFormatted}` && (newRouteMethod ? (newRouteMethod === requestMethod) : true)
                }) 

                if(isValidRoute) {
                    return newObjectRouter
                }
            }
            const matchedRoutes  = urlRoute.join("/") === `${thisRoute.join("/")}${newAlternativeRoute ?? ""}`;
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
                return newRoute.route === alternativeRoute && (newRoute.method ? (this.req?.method === newRoute.method) : true)
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

        private setPrevRoute(prevRoute : string) {
            this.prevRoute = prevRoute;
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
                this.server?.cbConfigError(error, this.req as RequestProps, this.res as ResponseProps);
            }
        }

        executeExternalInstanceRouter(callbacks : CallbacksProps, index : number) {
            const fnCallback : ObjectRouter = callbacks[index];
            const newCallback = fnCallback.executeExternalCallbackInstanceRouter.bind(fnCallback);
            newCallback(this.req as RequestProps, this.res as ResponseProps, this.server as XperiInstance, this.mainRoute);
        }
        
        executeExternalCallbackInstanceRouter(req : RequestProps, res : ResponseProps, server : XperiInstance, route : string) {
            try {
                this.executeRoutes(req, res, server, route);
            } catch(error) {
                server.cbConfigError(error, req, res);
            }
        }

        get(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks, method: 'GET' });
        }

        post(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks, method: 'POST' });
        }

        patch(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks, method: 'PATCH' });
        }

        put(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks, method: 'PUT' });
        }

        delete(route: string, ...callbacks : CallbacksProps) {
            this.routes.push({ route, callbacks, method: 'DELETE' });
        }
    }
}

export interface ObjectRouter extends UseRouterXperi.XperiRouter{};
import { CallbacksProps, NextFunction, RequestProps, ResponseProps, Router, XperiInstance } from "../xperi.js";
import { XperiError } from "../xperiError.js";

interface Routes{
    route :  string,
    callbacks : CallbacksProps
}

export namespace UseRouterXperi {
    export class XperiRouter{
        routes : Routes[] = [];
        mainRoute : string = '';
        res    : ResponseProps | null = null;
        req    : RequestProps  | null = null;
        server : XperiInstance | null = null;

        use(route: string, ...callbacks : CallbacksProps) {
            this.routes = [{ route, callbacks }];
        }

        executeRoutes(req : RequestProps, res : ResponseProps, server : XperiInstance){
            this.setRequest(req);
            this.setResponse(res);
            this.setServer(server);
            const route = this.routes.find(newRoute => this.checkRouteAndAlternativeRoute(newRoute.route, newRoute));
            if(route) {
                this.setMainRoute(route.route);
                this.implementMiddleware(route.callbacks);
            }
        }


        private checkRouteAndAlternativeRoute(route : string, objectRouter : Routes){
            let urlRoute  = this.getArrayWithoutSpace(this.req?.$.url?.split('/') || []);
            let thisRoute = this.getArrayWithoutSpace(route.split("/"));
            let alternativeRoute = urlRoute.join("/").replace(thisRoute.join("/"), ""); 
            
            const arrayAlternativeRouter = objectRouter.callbacks
            .map(cb => cb.routes?.find((newRoute : Routes) => newRoute.route === alternativeRoute)?.route)
            .filter(cb => cb);

            alternativeRoute = arrayAlternativeRouter[0];
            return urlRoute.join("/") === `${thisRoute.join("/")}${alternativeRoute}`
        }

        private getArrayWithoutSpace(array : any[]) {
            let newArray = [];
            for(const element of array) {
                if(element) {
                    newArray.push(element);
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

        private implementMiddleware(callbacks : CallbacksProps) {
            let nextFunction = false;
            const next = () => {
                nextFunction = true;
            };

            for(let i = 0; i < callbacks.length; i++) {
                if(nextFunction || i === 0) {
                    nextFunction = false;
                    this.executeCallback(callbacks, i, next);
                } 
            }
        }

        private async executeCallback(callbacks : CallbacksProps, index : number, next : NextFunction) {
            if(callbacks[index] instanceof UseRouterXperi.XperiRouter) {
                this.executeExternalInstanceRouter(callbacks, index);
                return;
            }

            await callbacks[index](this.req, this.res, next, this);
        }

        executeExternalInstanceRouter(callbacks : CallbacksProps, index : number) {
            const fnCallback : ObjectRouter = callbacks[index];
            const newCallback = fnCallback.executeExternalCallbackInstanceRouter.bind(fnCallback);

            newCallback(this.req as RequestProps, this.res as ResponseProps, this.server as XperiInstance, this.mainRoute);
        }
        
        executeExternalCallbackInstanceRouter(req : RequestProps, res : ResponseProps, server : XperiInstance, route : string) {
            const currentRoute = req.$.url?.replace(route, ''); 
            /**
             * Aqui será necessário recuperar a callback que pertence a rota setada na variável currentRoute.
             */
        }
    }
}

export interface ObjectRouter extends UseRouterXperi.XperiRouter{};
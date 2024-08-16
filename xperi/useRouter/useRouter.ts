import { NextFunction, RequestProps, ResponseProps, XperiInstance } from "../xperi.js";
import { XperiError } from "../xperiError.js";

interface Routes{
    method?      : string, 
    path         : string, 
    objectRouter : ObjectRouter
}

export namespace UseRouterXperi {
    export class RoutesXperi{
        routes : Routes[] | undefined;
    
        use(path : string, objectRouter : ObjectRouter) {
            this.validPath(path);
            this.setObjectRoutes({
                path, 
                objectRouter
            });

            return objectRouter;
        }

        private validPath(path : string) {
            const pathExists = this.pathExists(path);

            if(pathExists) {
                throw new XperiError('Route already exists');
            }
        }

        private pathExists(path : string) {
            return this.routes?.find(route => {
                path.toLowerCase() === route.path.toLowerCase()
            })
        }
    
        private setObjectRoutes(object : Routes) {
            this.routes?.push(object);
        }
    }
}

export const RoutesXperi = UseRouterXperi.RoutesXperi;

export interface ObjectRouter extends UseRouterXperi.RoutesXperi{};

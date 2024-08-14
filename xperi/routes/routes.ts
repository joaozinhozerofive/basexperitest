import { RequestProps, ResponseProps } from "../xperi.js";

export class RoutesXperi{
    private req : RequestProps;
    private res : ResponseProps;
    
    constructor(req : RequestProps, res : ResponseProps) {
        this.req = req;
        this.res = res;
    }
}
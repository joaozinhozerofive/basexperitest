import { ServerResponse } from "http";
export declare class ResponseXperi {
    private res;
    $: ServerResponse;
    constructor(res: ServerResponse);
    json(data: object): this;
    send(data: string, cb?: () => void): this;
    status(code: number): this;
    setHeader(name: string, value: string): this;
    contentType(type: string): this;
}

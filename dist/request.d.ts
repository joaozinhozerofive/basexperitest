import { IncomingMessage } from "http";
export declare class RequestXperi {
    private req;
    $: IncomingMessage;
    body: object | string | null | undefined;
    constructor(req: IncomingMessage);
    setBodyJson(): Promise<void>;
    setBody(): Promise<unknown>;
}

import { OutgoingHttpHeader, ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";

/**
 * This class is used to manipulate and store the request data.
 */
export class ResponseXperi{
    $ : ServerResponse;

    constructor(res :  ServerResponse ) {
        this.$ = res;
    }

    /**
     * Sends the data in the response as JSON.
     * @param {object | void} data 
     * @returns {ResponseXperi}
     */
    json(data : object | void) {
        this.contentType('application/json');
        this.$.end(JSON.stringify(data));
        return this;
    }

    /**
     * 
     * @param {string} data 
     * @param {CallableFunction} cb 
     * @returns {ResponseXperi}
     */    
    send(data : string, cb?: () => void) : ResponseXperi {
        this.$.end(data, cb);
        this.contentType('application/json');
        return this;
    }

    end(cb? : () => void) {
        this.$.end(cb);
    }

    status(code : number) {
        this.$.statusCode = code;
        return this;
    }

    setHeader(name : string, value : string) {
        this.$.setHeader(name, value);
        return this;
    }

    contentType(type : string) {
        this.setHeader('Content-Type', type);

        return this;
    }

    writeHead(statusCode : number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]) {
        this.$.writeHead(statusCode, headers);
    }
}

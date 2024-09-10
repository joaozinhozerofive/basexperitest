import { OutgoingHttpHeader, ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";
import { ResponseProps } from "../xperi.js";

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
    json(data : object | void) : ResponseXperi {
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

    /**
     * Method used to send a response.
     * @param {CallableFunction} cb 
     */
    end(cb? : () => void) {
        this.$.end(cb);
    }

    /**
     * Change the status code
     * @param {number} code 
     * @returns {ResponseXperi}
     */
    status(code : number) : ResponseXperi {
        this.$.statusCode = code;
        return this;
    }

    /**
     * Modifies the headers sent in the response to the request.
     * @param {string} name 
     * @param {string} value 
     * @returns {ResponseXperi}
     */
    setHeader(name : string, value : string) : ResponseXperi {
        this.$.setHeader(name, value);
        return this;
    }

    /**
     * Modifies the content type sent in the response to the request.
     * @param type 
     * @returns {ResponseXperi}
     */
    contentType(type : string): ResponseXperi {
        this.setHeader('Content-Type', type);

        return this;
    }

    /**
     * Writes the response status code and sets the headers before the response is actually sent.
     * @param statusCode 
     * @param headers 
     */
    writeHead(statusCode : number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]) {
        this.$.writeHead(statusCode, headers);
    }
}

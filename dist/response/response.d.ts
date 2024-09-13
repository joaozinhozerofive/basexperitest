import { OutgoingHttpHeader, ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";
/**
 * This class is used to manipulate and store the request data.
 */
export declare class ResponseXperi {
    $: ServerResponse;
    constructor(res: ServerResponse);
    /**
     * Sends the data in the response as JSON.
     * @param {object | void} data
     * @returns {ResponseXperi}
     */
    json(data: object | void): ResponseXperi;
    /**
     *
     * @param {string} data
     * @param {CallableFunction} cb
     * @returns {ResponseXperi}
     */
    send(data: string, cb?: () => void): ResponseXperi;
    /**
     * Method used to send a response.
     * @param {CallableFunction} cb
     */
    end(cb?: () => void): void;
    /**
     * Change the status code
     * @param {number} code
     * @returns {ResponseXperi}
     */
    status(code: number): ResponseXperi;
    /**
     * Modifies the headers sent in the response to the request.
     * @param {string} name
     * @param {string} value
     * @returns {ResponseXperi}
     */
    setHeader(name: string, value: string): ResponseXperi;
    /**
     * Modifies the content type sent in the response to the request.
     * @param type
     * @returns {ResponseXperi}
     */
    contentType(type: string): ResponseXperi;
    /**
     * Writes the response status code and sets the headers before the response is actually sent.
     * @param statusCode
     * @param headers
     */
    writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): void;
}

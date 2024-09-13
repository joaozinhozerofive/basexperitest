/**
 * This class is used to manipulate and store the request data.
 */
export class ResponseXperi {
    $;
    constructor(res) {
        this.$ = res;
    }
    /**
     * Sends the data in the response as JSON.
     * @param {object | void} data
     * @returns {ResponseXperi}
     */
    json(data) {
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
    send(data, cb) {
        this.$.end(data, cb);
        this.contentType('application/json');
        return this;
    }
    /**
     * Method used to send a response.
     * @param {CallableFunction} cb
     */
    end(cb) {
        this.$.end(cb);
    }
    /**
     * Change the status code
     * @param {number} code
     * @returns {ResponseXperi}
     */
    status(code) {
        this.$.statusCode = code;
        return this;
    }
    /**
     * Modifies the headers sent in the response to the request.
     * @param {string} name
     * @param {string} value
     * @returns {ResponseXperi}
     */
    setHeader(name, value) {
        this.$.setHeader(name, value);
        return this;
    }
    /**
     * Modifies the content type sent in the response to the request.
     * @param type
     * @returns {ResponseXperi}
     */
    contentType(type) {
        this.setHeader('Content-Type', type);
        return this;
    }
    /**
     * Writes the response status code and sets the headers before the response is actually sent.
     * @param statusCode
     * @param headers
     */
    writeHead(statusCode, headers) {
        this.$.writeHead(statusCode, headers);
    }
}

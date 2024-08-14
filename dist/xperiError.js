export class XperiError extends Error {
    message;
    constructor(message) {
        super(`XperiError: ${message}, statusCode : 500`);
        this.message = message;
    }
}

export class XperiError extends Error{
    message: string;

    constructor(message : string) {
        super(`XperiError: ${message}, statusCode : 500`);
        this.message = message;
    }
}
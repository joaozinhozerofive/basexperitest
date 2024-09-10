/**
 * This class throw all errors in xperi framework
 */
export class XperiError extends Error{
    message: string;

    constructor(message : string) {
        super(`XperiError: ${message}, statusCode : 500`);
        this.message = message;
    }
}
import { DeclaresTypes, NextFunction, RequestProps, ResponseProps, XperiInstance } from "../xperi.js";
import formidable, {errors as formidableErrors} from "formidable";
import path from "path";
import fs from "fs";
import { XperiError } from "../xperiError.js";

export class XperiUploadedFile {
    private field: string;    
    private options: object;
    files: object = {};

    constructor(field: string, options: object) {
        this.field = field;
        this.options = options;
    }

    getMiddleware() {
        return this.middleware.bind(this);
    }

    async middleware(req: RequestProps, res: ResponseProps, next: NextFunction) {
        const arrayContentType = req.contentType?.split(';');
        await this.setRequestFile(req, res);
        next();
    }

    setRequestFile(req: RequestProps, res: ResponseProps) { 
        req.processMultipart();
    }
}

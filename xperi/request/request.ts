import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { XperiError } from '../xperiError.js';
import formidable, { errors as formidableErrors, Part } from 'formidable';
import { ParsedUrlQuery } from 'querystring';
import fs from 'fs';
import IncomingForm from 'formidable/Formidable.js';
import path from 'path';
import { XperiInstance } from '../xperi.js';
import { upload, UploadError } from '../uploadErrors.js';

/**
 * Interface created to obtain the default options from formidable.
 * @interface OptionsFilesProps
 */
export interface OptionsFilesProps extends formidable.Options {
    allowExtensions?: string[];
    exceptionMaxFileSizeExceeded?: () => void;
    exceptionAllowedExtensions?: () => void;
    exceptionMaxFields?: () => void;
}

/**
 * Interface created to obtain the default headers from Node.js.
 * @interface Headers
 */
export interface Headers extends IncomingHttpHeaders {
    host?: string;
    contentType?: string;
    userAgent?: string;
    contentLength?: string;
    authorization: string;
    accept?: string;
    'accept-encoding'?: string;
    'accept-language'?: string;
    'cache-control'?: string;
    'cookie'?: string;
    'referer'?: string;
    'origin'?: string;
    'x-request-id'?: string;
    'x-forwarded-for'?: string;
    'x-forwarded-proto'?: string;
    'x-frame-options'?: string;
    'x-content-type-options'?: string;
    'strict-transport-security'?: string;
    'access-control-allow-origin'?: string;
    'access-control-allow-methods'?: string;
    'access-control-allow-headers'?: string;
    'etag'?: string;
    'last-modified'?: string;
}

/**
 * Interface for storing key-value pairs of parameters.
 * @interface Params
 */
export interface Params<T> {
    [key: string]: T;
}

/**
 * This class is used to manipulate and store the request data.
 * @class
 */
export class RequestXperi {
    $: IncomingMessage;
    body: object | string | null | undefined = {};
    contentType: string | undefined;
    files: { [key: string]: any } = {};
    fields: { [key: string]: any } = {};
    optionsFiles: OptionsFilesProps = { keepExtensions: true };
    fieldsFiles: string[] | void = [];
    method?: string = '';
    url: string = '';
    headers: Headers = { authorization: " " };
    query: { params?: ParsedUrlQuery } = {};
    params: Params<string | number> = {};

    /**
     * Constructs a new RequestXperi instance.
     * @param req - The incoming HTTP request.
     */
    constructor(req: IncomingMessage) {
        this.$ = req;
        this.contentType = this.$.headers['content-type'];
        this.method = this.$.method;
        this.url = this.$.url ?? "";
        this.setHeader();
    }

    /**
     * Modifies the request headers.
     */
    private setHeader() {
        this.headers = {
            ...this.$.headers,
            contentType: this.$.headers['content-type'],
            userAgent: this.$.headers['user-agent'],
            contentLength: this.$.headers['content-length'],
            authorization: this.$.headers?.authorization || " "
        };
    }

    /**
     * Modifies the query parameters.
     * @param object - The query parameters to set.
     */
    setQueryParams(object: ParsedUrlQuery) {
        this.query.params = { ...object };
    }

    /**
     * Modifies the request parameters.
     * @param params - The parameters to add.
     */
    addParams(params: Params<string | number>) {
        Object.entries(params).forEach(([key, value]) => {
            this.params[key] = Number(value) || String(value);
        });
    }

    /**
     * Saves the request body data as a JSON object readable by JavaScript.
     * @returns {Promise<unknown>} A promise that resolves with the request body.
     */
    setBodyJson(): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => {
                body += chunk.toString();
            });

            this.$.on('end', () => {
                try {
                    this.body = JSON.parse(body);
                    resolve(body);
                } catch (error) {
                    reject(new XperiError('Invalid JSON'));
                }
            });

            this.$.on('error', err => {
                reject(err);
            });
        });
    }

    /**
     * Saves the file fields sent in a Multipart/form-data.
     * @param fieldsFiles - An optional array of field names for files.
     */
    setFilesFields(fieldsFiles?: string[]) {
        this.fieldsFiles = fieldsFiles;
    }

    /**
     * Modifies the file saving options of the formidable library.
     * @param optionsFiles - The options to set for file handling.
     */
    setOptionsFiles(optionsFiles: OptionsFilesProps) {
        this.optionsFiles = optionsFiles;
    }

    /**
     * Processes the data sent in a Multipart/form-data request.
     * @throws {Error} If the Content-Type is not 'multipart/form-data'.
     */
    async processMultipart() {
        if (!this.contentType?.startsWith('multipart/form-data')) {
            throw new Error('Content-Type is not multipart/form-data');
        }
        const form = formidable(this.optionsFiles);

        try {
            await this.formidableParse(form);
        } catch (error: any) {
            this.configErrorUpload(error);
        }
    }

    /**
     * Configures the error handling for upload errors.
     * @param error - The error to handle.
     */
    private configErrorUpload(error: any) {
        if (error instanceof UploadError) {
            const callback = this.getCallbackUploadErrorByCodeError(error.code);

            callback && callback();
            return;
        }
    }

    /**
     * Gets the callback function associated with an upload error code.
     * @param code - The error code.
     * @returns {(() => void) | undefined} The callback function, or undefined if not found.
     */
    private getCallbackUploadErrorByCodeError(code: upload): ((invalidName? : string, code? : number) => void) | undefined {
        const callbacks: { [key in upload]?: () => void } = {
            [upload.maxFileSize]    : this.optionsFiles.exceptionMaxFileSizeExceeded,
            [upload.allowExtensions]: this.optionsFiles.exceptionAllowedExtensions || this.getCallbackErrorDefault.bind(this, 'extension', upload.allowExtensions),
            [upload.maxFields]      : this.optionsFiles.exceptionMaxFields
        };

        return callbacks[code];
    }

    private getCallbackErrorDefault(invalidName : string, code : number) {
        throw new UploadError(`Invalid ${invalidName}`, code);
    }

    /**
     * Parses the form data using formidable.
     * @param form - The formidable form instance.
     * @returns {Promise<null>} A promise that resolves when the parsing is complete.
     */
    private formidableParse(form: IncomingForm) {
        return new Promise((resolve, reject) => {
            form.parse(this.$, (err, fields, files) => {
                fields && this.setFieldsToJson(fields);
                files && this.setObjectFiles(files);
            });

            form.on('file', (name, file) => {
                const extension = path.extname(file.filepath).replace('.', '');

                if (this.optionsFiles.allowExtensions && !this.optionsFiles.allowExtensions.includes(extension)) {
                    fs.unlinkSync(file.filepath);
                    reject(new UploadError('Invalid file extension.', upload.allowExtensions));
                }

                if (this.fieldsFiles && !this.fieldsFiles.includes(name)) {
                    fs.unlinkSync(file.filepath);
                }
            });

            form.on('error', (error) => {
                reject(this.getUploadErrorByCodeErrorFormidable(error.code));
            });

            form.on('end', () => {
                resolve(null);
            });
        });
    }

    /**
     * Gets an upload error instance by its code.
     * @param code - The error code.
     * @returns {UploadError | undefined} The UploadError instance, or undefined if not found.
     */
    private getUploadErrorByCodeErrorFormidable(code: number) {
        const uploadError: { [key: number]: UploadError } = {
            [1009]: new UploadError('Invalid file size', upload.maxFileSize)
        };

        return uploadError[code];
    }

    /**
     * Transforms the fields sent in a Multipart/form-data into a JSON object.
     * @param fields - The fields to transform.
     */
    private setFieldsToJson(fields: formidable.Fields) {
        let entriesFields = Object.entries(fields);

        let multipartFields = entriesFields.map(([key, value]) => {
            value = value ?? [];
            let newValue = value.length === 1 ? value[0] : value;
            return { [key]: newValue };
        });

        const newFields: { [key: string]: any } = {};

        for (const element of multipartFields) {
            for (const [key, value] of Object.entries(element)) {
                newFields[key] = value;
            }
        }

        this.fields = newFields;
    }

    /**
     * Transforms the data from files into a JSON object.
     * @param files - The files to transform.
     */
    private setObjectFiles(files: formidable.Files<string>) {
        const arrayFilesByFields = this.getArrayFilesByFields(files);

        const arrayFiles = arrayFilesByFields?.map(([, value]) => {
            return value ?? [];
        });

        const persistentFiles = arrayFiles?.map(objectClass => {
            return objectClass;
        });

        const arrayObjectFiles = persistentFiles[0]?.map(file => {
            return {
                filename: file.originalFilename,
                newFilename: file.newFilename,
                path: file.filepath,
                mimeType: file.mimetype,
                size: file.size
            };
        });

        this.files = arrayObjectFiles;
    }

    /**
     * Returns an array containing all the data from the files sent in the request.
     * @param files - The files to filter and process.
     * @returns {array} An array of file data.
     */
    private getArrayFilesByFields(files: formidable.Files<string>) {
        if (this.fieldsFiles?.length) {
            return Object.entries(files).filter(([key]) => {
                return this.fieldsFiles?.includes(key);
            });
        }

        return Object.entries(files);
    }

    /**
     * Returns the content type of the request.
     * @returns {string | undefined} The content type of the request.
     */
    getContentType(): string | undefined {
        return this.$.headers['content-type'];
    }

    /**
     * Modifies the value of the request body, without necessarily being a JSON.
     * @returns {Promise<unknown>} A promise that resolves with the request body.
     */
    setBody(): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => {
                body += chunk.toString();
            });

            this.$.on('end', () => {
                try {
                    this.body = body;
                    resolve(this.body);
                } catch (error) {
                    reject(new XperiError('Invalid JSON'));
                }
            });

            this.$.on('error', err => {
                reject(err);
            });
        });
    }

    /**
     * Adds an event listener to the request.
     * @param event - The event name.
     * @param listener - The function to call when the event is emitted.
     */
    on(event: string, listener: () => void) {
        this.$.on(event, listener);
    }

    /**
     * Pipes the request data to a writable stream.
     * @param destination - The writable stream to pipe the data to.
     * @param options - Options for the pipe operation.
     * @returns {NodeJS.WritableStream} The destination writable stream.
     */
    pipe(destination: NodeJS.WritableStream, options?: { end?: boolean | undefined }): NodeJS.WritableStream {
        return this.$.pipe(destination, options);
    }
}

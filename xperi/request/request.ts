import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { XperiError } from '../xperiError.js';
import formidable, { File } from 'formidable';
import { ParsedUrlQuery } from 'querystring';
import fs, { unlinkSync } from 'fs';
import IncomingForm from 'formidable/Formidable.js';
import path from 'path';
import { upload, UploadError } from '../uploadErrors.js';
import xml2js from "xml2js";

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
    body: {[key : string] : any} = {};
    contentType: string | undefined;
    files: { [key: string]: any } = {};
    fields: { [key: string]: any } = {};
    optionsFiles: OptionsFilesProps = { keepExtensions: true };
    fieldsFiles: string[] | void = [];
    method?: string = '';
    url: string = '';
    headers: Headers = { authorization: " " };
    query: { params?: ParsedUrlQuery } = {};
    params: Params<any> = {};

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
        this.query = { ...object };
    }

    /**
     * Modifies the request parameters.
     * @param params - The parameters to add.
     */
    addParams<T>(params: Params<T>) {
        Object.entries(params).forEach(([key, value]) => {
            this.params[key] = typeof value === 'object' ? value : (Number(value) || String(value));
        });
    }

    /**
     * Saves the request body data as a JSON object readable by JavaScript.
     * @returns {Promise<unknown>} A promise that resolves with the request body.
     */
    setBodyJson(): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => body += chunk.toString());
            this.$.on('end', () => {
                try {
                    this.body = JSON.parse(body);
                    resolve(body);
                } catch (error) {
                    reject(new XperiError('Invalid JSON'));
                }
            });
            this.$.on('error', reject);
        });
    }

    /**
     * Saves the request body data as XML, converting it to JSON.
     * @returns {Promise<unknown>} A promise that resolves with the converted XML result.
     */
    setBodyXML(): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let xmlData = '';
            this.$.on('data', chunk => xmlData += chunk.toString());
            this.$.on('end', () => {
                xml2js.parseString(xmlData, (err, result) => {
                    if (err) {
                        return reject(new XperiError('Invalid XML'));
                    }
                    
                    this.body = result;
                    resolve(result);
                });
            });
            this.$.on('error', reject);
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
        } catch (error) {
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
        }
    }

    /**
     * Gets the callback function associated with an upload error code.
     * @param code - The error code.
     * @returns {(() => void) | undefined} The callback function, or undefined if not found.
     */
    private getCallbackUploadErrorByCodeError(code: upload): (() => void) | undefined {
        const callbacks: { [key in upload]?: () => void } = {
            [upload.maxFileSize]: this.optionsFiles.exceptionMaxFileSizeExceeded,
            [upload.allowExtensions]: this.optionsFiles.exceptionAllowedExtensions || (() => this.getCallbackErrorDefault('extension', upload.allowExtensions)),
            [upload.maxFields]: this.optionsFiles.exceptionMaxFields
        };
        return callbacks[code];
    }

    /**
     * Returns the default callback function for upload errors.
     * @param invalidName - The name of the error type (e.g., "extension").
     * @param code - The error code.
     * @returns {void}
     */
    private getCallbackErrorDefault(invalidName: string, code: number) {
        throw new UploadError(`Invalid ${invalidName}`, code);
    }

    /**
     * Parses the form data using formidable.
     * @param form - The formidable form instance.
     * @returns {Promise<File | null>} A promise that resolves when the parsing is complete.
     */
    private formidableParse(form: IncomingForm): Promise<File | null> {
        return new Promise((resolve, reject) => {
            form.parse(this.$, (err, fields, files) => {
                if (err) return reject(err);
                if (fields) this.setFieldsToJson(fields);
                if (files) this.setObjectFiles(files);
            });

            form.on('file', (name, file) => this.handleFile(name, file, reject));
            form.on('fileBegin', (name, file) => this.handleFileBegin(file, reject));
            form.on('error', (error) => reject(this.getUploadErrorByCodeErrorFormidable(error.code)));
            form.on('end', () => resolve(null));
        });
    }

    /**
     * Handles the uploaded file based on the field name and file data.
     * @param name - The field name of the file.
     * @param file - The uploaded file.
     * @param reject - Function to reject the promise in case of an error.
     */
    private handleFile(name: string, file: formidable.File, reject: (err: any) => void) {
        const extension = path.extname(file.filepath).replace('.', '');
        if (this.optionsFiles.allowExtensions && !this.optionsFiles.allowExtensions.includes(extension)) {
            fs.unlinkSync(file.filepath);
            return reject(new UploadError('Invalid file extension.', upload.allowExtensions));
        }
        if (this.fieldsFiles && !this.fieldsFiles.includes(name)) {
            fs.unlinkSync(file.filepath);
        }
    }

    /**
     * Handles the beginning of file upload.
     * @param file - The uploaded file.
     * @param reject - Function to reject the promise in case of an error.
     */
    private handleFileBegin(file: formidable.File, reject: (err: any) => void) {
        // Implementation of file begin handling if needed.
    }

    /**
     * Converts fields data to JSON.
     * @param fields - The fields data to convert.
     */
    private setFieldsToJson(fields: formidable.Fields) {
        this.fields = fields;
    }

    /**
     * Converts files data to a structured object.
     * @param files - The files data to convert.
     */
    private setObjectFiles(files: formidable.Files) {
        this.files = files;
    }

    /**
     * Gets the upload error based on the error code from formidable.
     * @param code - The error code.
     * @returns {UploadError} The corresponding upload error.
     */
    private getUploadErrorByCodeErrorFormidable(code: number): UploadError {
        return new UploadError('Upload error', code);
    }
}

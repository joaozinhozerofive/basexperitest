import { XperiError } from '../xperiError.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { upload, UploadError } from '../uploadErrors.js';
import xml2js from "xml2js";
/**
 * This class is used to manipulate and store the request data.
 * @class
 */
export class RequestXperi {
    $;
    body = {};
    contentType;
    files = {};
    fields = {};
    optionsFiles = { keepExtensions: true };
    fieldsFiles = [];
    method = '';
    url = '';
    headers = { authorization: " " };
    query = {};
    params = {};
    /**
     * Constructs a new RequestXperi instance.
     * @param req - The incoming HTTP request.
     */
    constructor(req) {
        this.$ = req;
        this.contentType = this.$.headers['content-type'];
        this.method = this.$.method;
        this.url = this.$.url ?? "";
        this.setHeader();
    }
    /**
     * Modifies the request headers.
     */
    setHeader() {
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
    setQueryParams(object) {
        this.query = { ...object };
    }
    /**
     * Modifies the request parameters.
     * @param params - The parameters to add.
     */
    addParams(params) {
        Object.entries(params).forEach(([key, value]) => {
            this.params[key] = typeof value === 'object' ? value : (Number(value) || String(value));
        });
    }
    /**
     * Saves the request body data as a JSON object readable by JavaScript.
     * @returns {Promise<unknown>} A promise that resolves with the request body.
     */
    setBodyJson() {
        return new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => body += chunk.toString());
            this.$.on('end', () => {
                try {
                    this.body = JSON.parse(body);
                    resolve(body);
                }
                catch (error) {
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
    setBodyXML() {
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
    setFilesFields(fieldsFiles) {
        this.fieldsFiles = fieldsFiles;
    }
    /**
     * Modifies the file saving options of the formidable library.
     * @param optionsFiles - The options to set for file handling.
     */
    setOptionsFiles(optionsFiles) {
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
        }
        catch (error) {
            this.configErrorUpload(error);
        }
    }
    /**
     * Configures the error handling for upload errors.
     * @param error - The error to handle.
     */
    configErrorUpload(error) {
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
    getCallbackUploadErrorByCodeError(code) {
        const callbacks = {
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
    getCallbackErrorDefault(invalidName, code) {
        throw new UploadError(`Invalid ${invalidName}`, code);
    }
    /**
     * Parses the form data using formidable.
     * @param form - The formidable form instance.
     * @returns {Promise<File | null>} A promise that resolves when the parsing is complete.
     */
    formidableParse(form) {
        return new Promise((resolve, reject) => {
            form.parse(this.$, (err, fields, files) => {
                if (err)
                    return reject(err);
                if (fields)
                    this.setFieldsToJson(fields);
                if (files)
                    this.setObjectFiles(files);
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
    handleFile(name, file, reject) {
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
    handleFileBegin(file, reject) {
        // Implementation of file begin handling if needed.
    }
    /**
     * Converts fields data to JSON.
     * @param fields - The fields data to convert.
     */
    setFieldsToJson(fields) {
        this.fields = fields;
    }
    /**
     * Converts files data to a structured object.
     * @param files - The files data to convert.
     */
    setObjectFiles(files) {
        this.files = files;
    }
    /**
     * Gets the upload error based on the error code from formidable.
     * @param code - The error code.
     * @returns {UploadError} The corresponding upload error.
     */
    getUploadErrorByCodeErrorFormidable(code) {
        return new UploadError('Upload error', code);
    }
}

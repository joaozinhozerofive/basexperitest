import { IncomingHttpHeaders, IncomingMessage } from 'http';
import formidable from 'formidable';
import { ParsedUrlQuery } from 'querystring';
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
export declare class RequestXperi {
    $: IncomingMessage;
    body: {
        [key: string]: any;
    };
    contentType: string | undefined;
    files: {
        [key: string]: any;
    };
    fields: {
        [key: string]: any;
    };
    optionsFiles: OptionsFilesProps;
    fieldsFiles: string[] | void;
    method?: string;
    url: string;
    headers: Headers;
    query: {
        params?: ParsedUrlQuery;
    };
    params: Params<any>;
    /**
     * Constructs a new RequestXperi instance.
     * @param req - The incoming HTTP request.
     */
    constructor(req: IncomingMessage);
    /**
     * Modifies the request headers.
     */
    private setHeader;
    /**
     * Modifies the query parameters.
     * @param object - The query parameters to set.
     */
    setQueryParams(object: ParsedUrlQuery): void;
    /**
     * Modifies the request parameters.
     * @param params - The parameters to add.
     */
    addParams<T>(params: Params<T>): void;
    /**
     * Saves the request body data as a JSON object readable by JavaScript.
     * @returns {Promise<unknown>} A promise that resolves with the request body.
     */
    setBodyJson(): Promise<unknown>;
    /**
     * Saves the request body data as XML, converting it to JSON.
     * @returns {Promise<unknown>} A promise that resolves with the converted XML result.
     */
    setBodyXML(): Promise<unknown>;
    /**
     * Saves the file fields sent in a Multipart/form-data.
     * @param fieldsFiles - An optional array of field names for files.
     */
    setFilesFields(fieldsFiles?: string[]): void;
    /**
     * Modifies the file saving options of the formidable library.
     * @param optionsFiles - The options to set for file handling.
     */
    setOptionsFiles(optionsFiles: OptionsFilesProps): void;
    /**
     * Processes the data sent in a Multipart/form-data request.
     * @throws {Error} If the Content-Type is not 'multipart/form-data'.
     */
    processMultipart(): Promise<void>;
    /**
     * Configures the error handling for upload errors.
     * @param error - The error to handle.
     */
    private configErrorUpload;
    /**
     * Gets the callback function associated with an upload error code.
     * @param code - The error code.
     * @returns {(() => void) | undefined} The callback function, or undefined if not found.
     */
    private getCallbackUploadErrorByCodeError;
    /**
     * Returns the default callback function for upload errors.
     * @param invalidName - The name of the error type (e.g., "extension").
     * @param code - The error code.
     * @returns {void}
     */
    private getCallbackErrorDefault;
    /**
     * Parses the form data using formidable.
     * @param form - The formidable form instance.
     * @returns {Promise<File | null>} A promise that resolves when the parsing is complete.
     */
    private formidableParse;
    /**
     * Handles the uploaded file based on the field name and file data.
     * @param name - The field name of the file.
     * @param file - The uploaded file.
     * @param reject - Function to reject the promise in case of an error.
     */
    private handleFile;
    /**
     * Handles the beginning of file upload.
     * @param file - The uploaded file.
     * @param reject - Function to reject the promise in case of an error.
     */
    private handleFileBegin;
    /**
     * Converts fields data to JSON.
     * @param fields - The fields data to convert.
     */
    private setFieldsToJson;
    /**
     * Converts files data to a structured object.
     * @param files - The files data to convert.
     */
    private setObjectFiles;
    /**
     * Gets the upload error based on the error code from formidable.
     * @param code - The error code.
     * @returns {UploadError} The corresponding upload error.
     */
    private getUploadErrorByCodeErrorFormidable;
}

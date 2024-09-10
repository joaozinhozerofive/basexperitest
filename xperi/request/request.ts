import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { XperiError } from '../xperiError.js';
import formidable, {errors as formidableErrors, Part} from 'formidable';
import { ParsedUrlQuery } from 'querystring';
/**
 * Interface created to obtain the default options from formidable
 * * See in.
 * @interface OptionsFilesProps 
 */
export type OptionsFilesProps  = formidable.Options;

/**
 * Interface created to obtain the default headers from Node.js.
 * @interface Headers 
 */
export interface Headers extends IncomingHttpHeaders{
    host? : string,
    contentType? : string, 
    userAgent? : string,
    contentLength? : string,
    authorization : string,
    accept? : string
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
 * @interface params
 */
export interface Params<T> {
    [key : string] : T;
}

/**
 * This class is used to manipulate and store the request data.
 * @class
 */
export class RequestXperi {
    $: IncomingMessage;
    body: object | string | null | undefined = {};
    contentType: string | undefined;
    files: {[key: string]: any } = {};
    fields : {[key : string] : any} = {}
    optionsFiles : OptionsFilesProps = {keepExtensions : true};
    fieldsFiles : string[] | void = [];
    method? : string = '';
    url: string = '';
    headers : Headers = {
        authorization : " "
    };
    query : {params? : ParsedUrlQuery } = {};
    params : Params<string | number> = {};

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
            contentType   : this.$.headers['content-type'], 
            userAgent     : this.$.headers['user-agent'],
            contentLength : this.$.headers['content-length'],
            authorization : this.$.headers?.authorization || " "
        }
    }

    /**
     * Modifies the query params;
     * @param {ParsedUrlQuery} object 
     */
    setQueryParams(object : ParsedUrlQuery) {
        this.query.params = {...object};
    }

    /**
     * Modifies the request params
     * @param {urlParams} params 
     */
    addParams(params : Params<string | number>) {
        Object.entries(params).forEach(([key, value]) => {
            this.params[key] = Number(value) || String(value);
        })
    }

    /**
     * Saves the request body data as a JSON object readable by JavaScript.
     * @returns {Promise<unknown>}
     */
    setBodyJson() : Promise<unknown> {
        return new Promise((resolve, reject) => {
            let body = '';
            this.$.on('data', chunk => {
                body += chunk.toString();
            });

            this.$.on('end', () => {
                try {
                    this.body = JSON.parse(body); ;
                    resolve(body);
                } catch (error) {
                    reject(new XperiError('Invalid JSON')); 
                }
            });

            this.$.on('error', err => {
                reject(err); 
            });
        })
    }

    /**
     * Saves the file fields sent in a Multipart/form-data.
     * @param {string[] | undefined} fieldsFiles 
     */
    setFilesFields(fieldsFiles? : string[]) {
        this.fieldsFiles = fieldsFiles; 
    }

    /**
     * Modifies the file saving options of the formidable library.
     * @param {OptionsFilesProps} optionsFiles 
     */
    setOptionsFiles(optionsFiles : OptionsFilesProps) {
        this.optionsFiles = optionsFiles;
    }

    /**
     * Processes the data sent in a Multipart/form-data.
     */
    async processMultipart() {
        if (!this.contentType?.startsWith('multipart/form-data')) {
            throw new Error('Content-Type is not multipart/form-data');
        }
        const form =  formidable(this.optionsFiles)
        const [fields, files] = await form.parse(this.$)
        this.setFieldsToJson(fields);
        this.setObjectFiles(files);
    }


    /**
     * Transforms the fields sent in a Multipart/form-data into a JSON.
     * @param {formidable.Fields} fields 
     */
    private setFieldsToJson(fields :  formidable.Fields) {
        let entriesFields = Object.entries(fields);
        
        let multipartFields = entriesFields.map(( [key, value] ) => {
            value = value ?? [];
            let newValue = value.length === 1 ? value[0] : value;
            return {[key] : newValue};
        })

        const newFields : {[key : string] : any} = {};

        for(const element of multipartFields){
            for(const [key, value] of Object.entries(element)) {
                newFields[key] =  value;
            }
        }

        this.fields = newFields;
    }

    /**
     * Transforms the data from a file into a JSON object.
     * @param {formidable.Files<string>} files 
     */
    private setObjectFiles(files : formidable.Files<string>) {
        const arrayFilesByFields = this.getArrayFilesByFields(files);

        const arrayFiles = arrayFilesByFields.map(([, value]) => {
            return value ?? [];
        });

        const persistentFiles = arrayFiles.map(objectClass => {
            return objectClass[0];
        })

        const arrayObjectFiles = persistentFiles.map(file => {
            return {
                filename    : file.originalFilename,
                newFilename : file.newFilename, 
                path        : file.filepath, 
                mimeType    : file.mimetype, 
                size        : file.size
            }
        })

        this.files = arrayObjectFiles;
    } 

    /**
     * Returns an array containing all the data from the files sent in the request.
     * @param {formidable.Files<string>} files 
     * @returns {array}
     */
    private getArrayFilesByFields(files : formidable.Files<string>) {
        if(this.fieldsFiles?.length) {
            return Object.entries(files).filter(([key]) => {
                return this.fieldsFiles?.includes(key);
            })
        }

        return Object.entries(files);
    }

    /**
     * Return request contentType 
     * @returns {string | undefined}
     */
    getContentType() : string | undefined {
        return this.$.headers['content-type'];
    }

    /**
     * Modifies the value of the request body, without necessarily being a JSON.
     * @returns {Promise<unknown>}
     */
    setBody() : Promise<unknown> {
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
     * Adds an event to the request.
     * @param {string} event 
     * @param {CallableFunction} listener 
     */
    on(event : string, listener : () => void) {
        this.$.on(event, listener);
    }

    /**
     * A tube used to transfer data from a stream. 
     * @param {NodeJS.WritableStream} destination Use request.$
     * @param {object} options 
     * @returns {NodeJS.WritableStream}
     */
    pipe(destination: NodeJS.WritableStream, options?: { end?: boolean | undefined } | undefined): NodeJS.WritableStream {
        return this.$.pipe(destination, options);
    }
}

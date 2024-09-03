import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { XperiError } from './xperiError.js';
import formidable, {errors as formidableErrors, Part} from 'formidable';
import { ParsedUrlQuery } from 'querystring';

export type OptionsFilesProps  = formidable.Options;

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

export interface urlParams {
    [key : string] : string
}

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
    params : urlParams = {};

    constructor(req: IncomingMessage) {
        this.$ = req;
        this.contentType = this.$.headers['content-type'];
        this.method = this.$.method;
        this.url = this.$.url ?? "";
        this.setHeader();
    }

    private setHeader() {
        this.headers = {
            ...this.$.headers, 
            contentType   : this.$.headers['content-type'], 
            userAgent     : this.$.headers['user-agent'],
            contentLength : this.$.headers['content-length'],
            authorization : this.$.headers?.authorization || " "
        }
    }

    setQueryParams(object : ParsedUrlQuery) {
        this.query.params = {...object};
    }

    setBodyJson() {
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

    setFieldsFile(fieldsFiles? : string[]) {
        this.fieldsFiles = fieldsFiles; 
    }

    setOptionsFiles(optionsFiles : OptionsFilesProps) {
        this.optionsFiles = optionsFiles;
    }

    async processMultipart() {
        if (!this.contentType?.startsWith('multipart/form-data')) {
            throw new Error('Content-Type is not multipart/form-data');
        }
        const form =  formidable(this.optionsFiles)
        const [fields, files] = await form.parse(this.$)
        this.setFieldsToBodyJson(fields);
        this.setObjectFiles(files);
    }


    private setFieldsToBodyJson(fields :  formidable.Fields) {
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

    private getArrayFilesByFields(files : formidable.Files<string>) {
        if(this.fieldsFiles?.length) {
            return Object.entries(files).filter(([key]) => {
                return this.fieldsFiles?.includes(key);
            })
        }

        return Object.entries(files);
    }

    getContentType() {
        return this.$.headers['content-type'];
    }

    setBody() {
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

    pipe(destination: NodeJS.WritableStream, options?: { end?: boolean | undefined } | undefined): NodeJS.WritableStream {
        return this.$.pipe(destination, options);
    }
}

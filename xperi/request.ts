import { IncomingMessage } from 'http';
import { XperiError } from './xperiError.js';
import formidable, {errors as formidableErrors, Part} from 'formidable';
import path from 'path';
import IncomingForm from 'formidable/Formidable.js';
import { randomBytes } from 'crypto';

export type OptionsFilesProps  = formidable.Options;

export class RequestXperi {
    $: IncomingMessage;
    public body: object | string | null | undefined = {};
    public contentType: string | undefined;
    public files: {[key: string]: any } = {};
    public fields : {[key : string] : any} = {}
    public optionsFiles : formidable.Options = {};
    private fieldsFiles : string[] = [];

    constructor(req: IncomingMessage) {
        this.$ = req;
        this.contentType = this.$.headers['content-type'];
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

    setFieldsFile(fieldsFiles : string[]) {
        this.fieldsFiles = fieldsFiles; 
    }

    setOptionsFiles(optionsFiles : OptionsFilesProps) {
        this.optionsFiles = optionsFiles;
    }

    async processMultipart() {
        if (!this.contentType?.startsWith('multipart/form-data')) {
            throw new Error('Content-Type is not multipart/form-data');
        }

        this.formatOptionsFiles();
        const form =  formidable(this.optionsFiles)

        const [fields, files] = await form.parse(this.$)
        this.setFieldsToBodyJson(fields);
        this.setObjectFiles(files);
    }

    private formatOptionsFiles() {
        this.optionsFiles.keepExtensions = true;
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
        if(this.fieldsFiles.length) {
            return Object.entries(files).filter(([key, value]) => {
                return this.fieldsFiles.includes(key);
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

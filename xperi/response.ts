import { OutgoingHttpHeader, ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";

export class ResponseXperi{
    $ : ServerResponse;

    constructor(res :  ServerResponse ) {
        this.$ = res;
    }

    json(data : object) {
        this.$.end(JSON.stringify(data));
         
        return this;
    }
    
    send(data : string, cb?: () => void) {
        this.$.end(data, cb);
        this.contentType('application/json');
        return this;
    }

    end(cb? : () => void) {
        this.$.end(cb);
    }

    status(code : number) {
        this.$.statusCode = code;
        
        return this;
    }

    setHeader(name : string, value : string) {
        this.$.setHeader(name, value);
        return this;
    }

    contentType(type : string) {
        this.setHeader('Content-Type', type);

        return this;
    }

    writeHead(statusCode : number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]) {
        this.$.writeHead(303, { Connection: 'close', Location: '/' });
    }

}

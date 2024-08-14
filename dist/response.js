export class ResponseXperi {
    res;
    $;
    constructor(res) {
        this.res = res;
        this.$ = res;
    }
    json(data) {
        this.res.end(JSON.stringify(data));
        return this;
    }
    send(data, cb) {
        this.res.end(data, cb);
        this.contentType('application/json');
        return this;
    }
    status(code) {
        this.res.statusCode = code;
        return this;
    }
    setHeader(name, value) {
        this.res.setHeader(name, value);
        return this;
    }
    contentType(type) {
        this.setHeader('Content-Type', type);
        return this;
    }
}

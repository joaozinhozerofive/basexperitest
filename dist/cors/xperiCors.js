export class Cors {
    origins;
    methods;
    headers;
    allowCredentials;
    maxAge;
    exposeHeaders;
    constructor({ origins, methods, headers, allowCredentials, maxAge, exposeHeaders }) {
        this.setOrigins(origins);
        this.setHeaders(headers);
        this.setMethods(methods);
        this.setCredentials(allowCredentials);
        this.setMaxAge(maxAge);
        this.setExposeHeaders(exposeHeaders);
    }
    /**
     * Change value of cors origins
     * @param {string[] | string} origins
     */
    setOrigins(origins) {
        const { origins: originsDefault } = this.getObjectCorsDefault();
        this.origins = origins
            ? (Array.isArray(origins) ? origins : [origins])
            : originsDefault;
    }
    /**
     * Change allowed methods
     * @param {string[] | string} methods
     */
    setMethods(methods) {
        const { methods: methodsDefault } = this.getObjectCorsDefault();
        this.methods = methods
            ? (Array.isArray(methods) ? methods : [methods])
            : methodsDefault;
    }
    /**
     * Change allowed headers
     * @param {string[] | string} headers
     */
    setHeaders(headers) {
        const { headers: headersDefault } = this.getObjectCorsDefault();
        this.headers = headers
            ? (Array.isArray(headers) ? headers : [headers])
            : headersDefault;
    }
    /**
     * Inform the credentials permission
     * @param {boolean | undefined} allowedCredentials
     */
    setCredentials(allowedCredentials) {
        const { allowCredentials: credentialsDefault } = this.getObjectCorsDefault();
        this.allowCredentials = allowedCredentials ?? credentialsDefault;
    }
    /**
     * Change the max-age value of preflight
     * @param {number | undefined} maxAge
     */
    setMaxAge(maxAge) {
        const { maxAge: maxAgeDefault } = this.getObjectCorsDefault();
        this.maxAge = maxAge ?? maxAgeDefault;
    }
    /**
     * Change the headers that can be exposed.
     * @param {string[] | string} exposeHeaders
     */
    setExposeHeaders(exposeHeaders) {
        const { exposeHeaders: exposeHeadersDefault } = this.getObjectCorsDefault();
        this.exposeHeaders = exposeHeaders
            ? (Array.isArray(exposeHeaders) ? exposeHeaders : [exposeHeaders])
            : exposeHeadersDefault;
    }
    /**
     * Return an object containing the default CORS settings.
     * @returns {CorsProps}
     */
    getObjectCorsDefault() {
        return {
            origins: ["*"],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            headers: ['Content-Type', 'Authorization', 'Accept', 'X-Auth-Token'],
            allowCredentials: true,
            maxAge: 3600,
            exposeHeaders: ['X-Custom-Header']
        };
    }
    /**
     * Main CORS middleware -- applies all headers.
     * @param {RequestProps} req
     * @param {ResponseProps} res
     * @param {NextFunction} next
     */
    apply(req, res, next) {
        const origin = req.headers.origin || '';
        if (!origin && this.origins && this.origins[0] != "*") {
            res.status(403).send('CORS is not allowed');
        }
        if (this.origins?.includes(origin) || (this.origins && this.origins[0] == '*')) {
            res.setHeader('Access-Control-Allow-Origin', (origin || "*"));
        }
        else {
            res.status(403).send('Forbidden');
            return;
        }
        if (req.method === 'OPTIONS') {
            this.methods?.length && res.setHeader('Access-Control-Allow-Methods', this.methods.join(', '));
            this.headers?.length && res.setHeader('Access-Control-Allow-Headers', this.headers.join(', '));
            this.allowCredentials && res.setHeader('Access-Control-Allow-Credentials', this.allowCredentials ? 'true' : 'false');
            this.maxAge && res.setHeader('Access-Control-Max-Age', this.maxAge.toString());
            this.exposeHeaders?.length && res.setHeader('Access-Control-Expose-Headers', this.exposeHeaders.join(', '));
            res.status(204);
            return;
        }
        this.methods?.length && res.setHeader('Access-Control-Allow-Methods', this.methods.join(', '));
        this.headers?.length && res.setHeader('Access-Control-Allow-Headers', this.headers.join(', '));
        this.allowCredentials && res.setHeader('Access-Control-Allow-Credentials', this.allowCredentials ? 'true' : 'false');
        this.maxAge && res.setHeader('Access-Control-Max-Age', this.maxAge.toString());
        this.exposeHeaders?.length && res.setHeader('Access-Control-Expose-Headers', this.exposeHeaders.join(', '));
        next();
    }
}
/**
 * "Export the cors variable with the main middleware.
 * @param options
 * @returns
 */
export const apllyCors = (options) => {
    const corsInstance = new Cors(options);
    return corsInstance.apply.bind(corsInstance);
};

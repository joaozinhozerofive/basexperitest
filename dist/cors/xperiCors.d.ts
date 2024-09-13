import { NextFunction, RequestProps, ResponseProps } from "../xperi.js";
/**
 * @interface CorsProps
 * Props of xperi cors
 */
export interface CorsProps {
    origins?: string[] | string;
    methods?: string[] | string;
    headers?: string[] | string;
    allowCredentials?: boolean;
    maxAge?: number;
    exposeHeaders?: string[] | string;
}
export declare class Cors {
    private origins?;
    private methods?;
    private headers?;
    private allowCredentials?;
    private maxAge?;
    private exposeHeaders?;
    constructor({ origins, methods, headers, allowCredentials, maxAge, exposeHeaders }: CorsProps);
    /**
     * Change value of cors origins
     * @param {string[] | string} origins
     */
    setOrigins(origins?: string[] | string): void;
    /**
     * Change allowed methods
     * @param {string[] | string} methods
     */
    setMethods(methods?: string[] | string): void;
    /**
     * Change allowed headers
     * @param {string[] | string} headers
     */
    setHeaders(headers?: string[] | string): void;
    /**
     * Inform the credentials permission
     * @param {boolean | undefined} allowedCredentials
     */
    setCredentials(allowedCredentials?: boolean): void;
    /**
     * Change the max-age value of preflight
     * @param {number | undefined} maxAge
     */
    setMaxAge(maxAge?: number): void;
    /**
     * Change the headers that can be exposed.
     * @param {string[] | string} exposeHeaders
     */
    setExposeHeaders(exposeHeaders?: string[] | string): void;
    /**
     * Return an object containing the default CORS settings.
     * @returns {CorsProps}
     */
    private getObjectCorsDefault;
    /**
     * Main CORS middleware -- applies all headers.
     * @param {RequestProps} req
     * @param {ResponseProps} res
     * @param {NextFunction} next
     */
    apply(req: RequestProps, res: ResponseProps, next: NextFunction): void;
}
/**
 * "Export the cors variable with the main middleware.
 * @param options
 * @returns
 */
export declare const apllyCors: (options: CorsProps) => (req: RequestProps, res: ResponseProps, next: NextFunction) => void;

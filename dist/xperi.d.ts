import { Server } from 'http';
import { ResponseXperi } from './response.js';
import { RequestXperi } from './request.js';
export interface XperiProps {
    server: Server;
    port: Number;
}
export interface RegisterProps {
    req: RequestProps;
    res: ResponseProps;
    cb: () => void;
}
export type NextFunction = () => void;
export type ErrorHandler = Error | undefined;
export type CallbacksProps = ((req: RequestProps, res: ResponseProps, next: NextFunction) => Promise<void | object>)[];
export type CallbackErrorProps = ((error: unknown, req: RequestProps, res: ResponseProps) => Promise<void | object>);
export declare namespace xperiFrame {
    class Xperi {
        private server;
        private port;
        private useJson;
        private callbacks;
        private cbError;
        use(...callbacks: CallbacksProps): void;
        configError(cbError: CallbackErrorProps): void;
        listen(port: number, callback?: () => void): void;
        private implementMiddleware;
        useJSON(): void;
        uploadedFile(field: string): (req: RequestProps, res: ResponseProps, next: NextFunction) => Promise<void>;
        middlewareUploadedFile(req: RequestProps, res: ResponseProps, next: NextFunction): Promise<void>;
        close(): void;
    }
    const xperi: Xperi;
}
declare const xperi: () => xperiFrame.Xperi;
export default xperi;
export interface ResponseProps extends ResponseXperi {
}
export interface RequestProps extends RequestXperi {
}

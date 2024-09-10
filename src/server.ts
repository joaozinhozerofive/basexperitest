import xperi, { NextFunction, OptionsFiles, RequestProps, ResponseProps, Router } from "../xperi/xperi.ts";
export const app = xperi();
import {cors} from "../xperi/cors/xperiCors.ts";
import { routes } from "./routes/index.ts";

export class AppError{
    message   : string;
    statusCode: number;

    constructor(message : string, statusCode : number = 500) {
        this.message    = message;
        this.statusCode = statusCode;
    }
}
app.error(async (error : unknown, req : RequestProps, res: ResponseProps) => {
    if(error instanceof AppError) {
        res.status(error.statusCode).json({
            error  : error.message,
            status : error.statusCode
        });

        return;
    }

    console.log(error);
})

app.use(routes);

const port = 9090;
app.listen(port, () => { console.log(`Server is running on port ${port}`)});
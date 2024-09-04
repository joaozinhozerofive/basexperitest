import xperi, { NextFunction, RequestProps, ResponseProps, Router } from "../xperi/xperi.ts";
export const app = xperi();
import {cors} from "../xperi/cors/xperiCors.ts";

class AppError{
    message   : string;
    statusCode: number;

    constructor(message : string, statusCode : number = 500) {
        this.message    = message;
        this.statusCode = statusCode;
    }
}
app.configError(async (error : unknown, req : RequestProps, res: ResponseProps) => {
    if(error instanceof AppError) {
        res.status(error.statusCode).json({
            error  : error.message,
            status : error.statusCode
        });

        return;
    }

    console.log(error);
})


const newRoutes = Router();

newRoutes.post("/horaDoFraut", (req : RequestProps, res, next) => {
    const [, token] = req.headers.authorization.split(" ")[1];

    if(token) {
        next && next();
    }
}, async (req : RequestProps, res : ResponseProps) => {
    throw new AppError('caiu no post', 404)
})

newRoutes.get("/horaDoFraut", async (req : RequestProps, res : ResponseProps) => {
    throw new AppError('caiu no get', 404)
})

newRoutes.delete("/horaDoFraut/:id/teste/:user_id", async (req : RequestProps, res : ResponseProps, next : NextFunction, server) => {
  console.log(req.params)
  res.json({
    teste : "caiu no delete"
  })
})

const routes = Router();
routes.use('/teste/:teste', (t, a, next) => {next && next()}, newRoutes);

app.use(cors({exposeHeaders : ""}), routes);

const port = 9090;
app.listen({ 
  port, 
  callback : () => { console.log(`Server is running on port ${port}`)} });
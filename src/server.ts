import xperi, { NextFunction, RequestProps, ResponseProps, Router } from "../xperi/xperi.ts";
export const app = xperi();

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

newRoutes.delete("/horaDoFraut", async (req : RequestProps, res : ResponseProps, next : NextFunction, server) => {
    try {
        return new Promise(async (resolve, reject) => {
            throw new AppError('caiu no delete', 404)
        })
    }
    catch(error) {
        server?.cbConfigError(error, req, res);
    }

})

const routes = Router();
routes.use('/teste/piazada', app.uploadedFiles(['fileOne', 'fileTwo'], {uploadDir : "../xperi/src/uploads", keepExtensions : true}), newRoutes);

app.use(routes);

const port = 9090;
app.listen({ 
  port, 
  callback : () => { console.log(`Server is running on port ${port}`)} });
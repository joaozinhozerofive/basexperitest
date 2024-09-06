import xperi, { NextFunction, OptionsFiles, RequestProps, ResponseProps, Router } from "../xperi/xperi.ts";
export const app = xperi();
import {cors} from "../xperi/cors/xperiCors.ts";
import path from "path";

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

const options : OptionsFiles = {
    uploadDir      : `C:/Users/joaov/Desktop/Projetos - Intermediário/Nodejs/xperi/src/uploads`,
    keepExtensions : true
};

newRoutes.post("/horaDoFraut/:user_id", app.uploadedFiles(options, 'fileOne', 'fileTwo'), async (req : RequestProps, res : ResponseProps) => {
    res.json(req.files)
})

newRoutes.get("/horaDoFraut", async (req : RequestProps, res : ResponseProps) => {
    throw new AppError('caiu no get', 404)
})

newRoutes.delete("/horaDoFraut/:id/teste/:user_id", async (req : RequestProps, res : ResponseProps, next : NextFunction, server) => {
  res.json({
    teste : "caiu no delete"
  })
})

const routes = Router();

routes.use('/mouse/:mouse', () => {
});

routes.use('/teste/:teste', cors({exposeHeaders : ""}),  newRoutes);

app.use(routes);

const port = 9090;
app.listen({ 
  port, 
  callback : () => { console.log(`Server is running on port ${port}`)} });
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
const newRoutes = Router();
newRoutes.use("/horaDoFraut", (req, res, next) => {
    console.log('caiu aqui');
}) 

const routes = Router();
routes.use('/teste/piazada', app.uploadedFiles(['fileOne', 'fileTwo'], {uploadDir : "../xperi/src/uploads", keepExtensions : true}), newRoutes);

app.use(routes);

const port = 9090;
app.listen({ 
  port, 
  callback : () => { console.log(`Server is running on port ${port}`)} });
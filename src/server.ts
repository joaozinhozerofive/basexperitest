import { randomBytes } from "crypto";
import xperi, {NextFunction, RequestProps, ResponseProps } from "../xperi/xperi.ts";
import { Part } from "formidable";
import IncomingForm from "formidable/Formidable";
export const app = xperi();

class AppError{
    message   : string;
    statusCode: number;

    constructor(message : string, statusCode : number = 500) {
        this.message    = message;
        this.statusCode = statusCode;
    }
}

app.configError(async (error : unknown, req : RequestProps, res : ResponseProps) => {
    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            status  : "error", 
            message : error.message
        })
    }
})
const optionsUpload = {
    uploadDir : 'C:/Users/joaov/Desktop/Projetos - Intermediário/Nodejs/xperi/src/uploads',
    keepExtensions : true, 
    filename : ((name: string, ext: string, part: Part, form: IncomingForm) => {
        const fileHash = randomBytes(16).toString('hex');
        return `${fileHash}${name}${ext}`;
    })
}


app.use(app.uploadedFiles(['fileOne'], optionsUpload), async (req : RequestProps, res : ResponseProps) => {
   res.json({
    teste : "testando"
   })   
});
const port = 9090;
app.listen(
    { port, 
      callback : () => { console.log(`Server is running on port ${port}`) }
    });
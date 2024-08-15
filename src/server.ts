import { randomBytes } from "crypto";
import xperi, {RequestProps, ResponseProps } from "../xperi/xperi.ts";
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

app.uploadedFiles(['fileOne', 'fileTwo'], optionsUpload)
app.use(async (req : RequestProps, res : ResponseProps) => {
    if(true) {
        res.json(req.files); 
    }
}) 

const PORT = 9090;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
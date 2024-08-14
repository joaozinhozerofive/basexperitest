import xperi, {RequestProps, ResponseProps } from "../xperi/xperi.ts";
const app = xperi();

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

app.use(app.uploadedFile('file'), async (req : RequestProps, res : ResponseProps) => {
    if(true) {
        res.json({
            request : req.body
        }); 
    }
}) 

const PORT = 9090;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
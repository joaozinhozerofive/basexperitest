import { RequestProps, ResponseProps } from "../xperi/xperi";
import { app } from "./app";
import { routes } from "./routes";
import { AppError } from "./utils/app-error";


app.error(async (error : unknown, req : RequestProps, res: ResponseProps) => {
    if(error instanceof AppError) {
        res.status(error.statusCode).json({
            error  : error.message,
            status : error.statusCode
        });

        return;
    }
})

const port = 9090;
app.use(routes);

app.listen(port, () => { console.log(`Server is running on port ${port}`)});
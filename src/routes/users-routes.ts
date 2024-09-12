import { NextFunction, OptionsFiles, RequestProps, ResponseProps, Router } from "../../xperi/xperi";
import { app } from "../app";
import { UsersController } from "../controllers/users.controller";
import { AppError } from "../utils/app-error";

const usersRoutes = Router();
const usersController = new UsersController 

const optionsUpload : OptionsFiles = {
    keepExtensions : true, 
    uploadDir      : 'C:/Users/joaov/Desktop/Projetos - Intermediário/Nodejs/xperi/src/uploads', 
    allowExtensions : ['jpg'],
    exceptionMaxFileSizeExceeded : () => {
        throw new AppError('O tamanho do arquivo ultrapassou o limite de 1024 bytes.', 400)
    }, 
    exceptionAllowedExtensions : () => {
        throw new AppError(`Apenas arquivos com extensão ${optionsUpload.allowExtensions?.join(', ')} são permitidos.` , 400)
    }
};

usersRoutes.get('/:user_id', usersController.show);
usersRoutes.get('/', usersController.index);
usersRoutes.delete('/:user_id', usersController.delete);
usersRoutes.post('/', app.upload(optionsUpload, 'img', 'teste'), usersController.post);

export {usersRoutes};

import { NextFunction, RequestProps, ResponseProps, Router } from "../../xperi/xperi";
import { UsersController } from "../controllers/users.controller";
import { AppError } from "../server";

export const usersRoutes = Router();
const usersController = new UsersController 
usersRoutes.get('/:user_id', usersController.show)
usersRoutes.get('/', usersController.index)


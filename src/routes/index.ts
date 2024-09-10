import { RequestProps, ResponseProps, Router } from "../../xperi/xperi";
import { usersRoutes } from "./users-routes";

export const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/orders', () => {
    console.log('testando')
});
routes.use('/terceiroTeste');

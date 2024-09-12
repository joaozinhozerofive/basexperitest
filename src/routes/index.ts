import { RequestProps, ResponseProps, Router } from "../../xperi/xperi";
import { usersRoutes } from "./users-routes";

export const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/orders', (req, res) => {
    res?.json({
        teste : 'caiu aqui'
    });
});

routes.use('/terceiroTeste');

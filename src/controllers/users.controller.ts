import { NextFunction, RequestProps, ResponseProps } from "../../xperi/xperi";
import { AppError } from "../server";

var users = [
    {
      name   : "João",  
      id     : 'b66f13b9-0b66-4aa0-9d49-0abe3002b0e8', 
      email  : 'crikecralodi-5246@yopmail.com', 
      age    : '18 years'
    },
    {
      name   : "Lucas",  
      id     : '6608afc3-040d-41c8-8bd0-c83ae803f9e7', 
      email  : 'nouqueihateimmu-4530@yopmail.com', 
      age    : '19 years'
    },
    {
      name   : "Pedro",  
      id     : '07ca313c-d908-458f-85a3-4cb5118d9d98', 
      email  : 'troquodovosoi-8132@yopmail.com', 
      age    : '20 years'
    },
];

export class UsersController {
    show(req : RequestProps, res : ResponseProps, next : NextFunction) {
        const {user_id} = req.params;

        const user = users.find(user => user.id === user_id)

        if(!user) {
            throw new AppError("Usuário não encontrado.", 404);
        }

        res.json(user)
    }


    index(req : RequestProps, res : ResponseProps, next : NextFunction) {
        if(!users) {
            return;
        }

        res.json(users)
    }
}
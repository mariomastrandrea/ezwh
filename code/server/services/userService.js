const User = require("../models/user");
const encryption = require("../utilityEncryption");

class UserService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    //GET /api/userinfo 
    async getUserInfo(username, type) {
        const result = await this.#dao.getUser(username, type).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if (!result) {
            return {
                code: 500,
                error: "User not available"
            };
        }

        return {
            code: 200,
            object: {
                id: result.getId(),
                username: result.getEmail(),
                name: result.getName(),
                surname: result.getSurname(),
                type: result.getType()
            }
        };
    }

    //GET /api/suppliers 
    async getAllSuppliers() {
        const result = await this.#dao.getAllUsersOfType("SUPPLIER").catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        const users = [];
        for (let u of result) {
            users.push({
                id: u.getId(),
                name: u.getName(),
                surname: u.getSurname(),
                email: u.getEmail()
            })
        }

        return {
            code: 200,
            object: users
        };        
    }

    //GET /api/users
    async getAllUsers() {
        const result = await this.#dao.getAllUsers().catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        const users = [];
        for (let u of result) {
            users.push({
                id: u.getId(),
                name: u.getName(),
                surname: u.getSurname(),
                email: u.getEmail(),
                type: u.getType()
            })
        }

        return {
            code: 200,
            object: users
        };        
    }

    //POST /api/newUser
    async createNewUser(name,surname,username,type,password){
        const user = await this.#dao.getUser(username, type).catch(err => "ErrorDB");

        if (user === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if (user) {
            return {
                code: 409,
                error: "User already exists"
            };
        }

        const hashedPassword = await encryption.hashPassword(password);
        const result = await this.#dao.storeNewUser(new User(null, name, surname, username, type, hashedPassword)).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 201
        };
    }

    //POST /api/______Sessions
    async login(username,password,type){
        const user = await this.#dao.getUser(username, type).catch(err => "ErrorDB");

        if (user === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if (!user) {
            return {
                code: 401,
                error: "Wrong username"
            };
        }

        if(!(await encryption.comparePassword(password,user.getPassword()))){
            return {
                code: 401,
                error: "Wrong password"
            };
        }

        return {
            code: 200,
            object: {
                id: user.getId(),
                username: user.getEmail(),
                name: user.getName()
            }
        };
    }

    //PUT /api/users/:username
    async updateUserRights(username,oldType,newType){
        const user = await this.#dao.getUser(username, oldType).catch(err => "ErrorDB");

        if (user === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if (!user) {
            return {
                code: 404,
                error: "User not found"
            };
        }

        const newUser = await this.#dao.getUser(username, newType).catch(err => "ErrorDB");

        if (newUser === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if (newUser) {
            return {
                code: 422,
                error: "User already present"
            };
        }

        const result = await this.#dao.updateUser(new User(user.getId(), user.getName(), user.getSurname(), user.getEmail(), newType, user.getPassword())).catch(err => "ErrorDB");

        if (result === "ErrorDB" || result === 0) {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 200,
        };        
    }

    //DELETE /api/users/:username/:type
    async deleteUser(username,type){
        const user = await this.#dao.getUser(username, type).catch(err => "ErrorDB");

        if (user === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if (!user) {
            return {
                code: 422,
                error: "User not found"
            };
        }

        const result = await this.#dao.deleteUser(user.getId()).catch(err => "ErrorDB");

        if (result === "ErrorDB" || result === 0) {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 204,
        };
    }
}

module.exports = UserService;
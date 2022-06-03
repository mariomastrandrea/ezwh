const User = require("../models/user");
const encryption = require("../utilityEncryption");
const { 
    OK, 
    CREATED, 
    NO_CONTENT, 
    UNAUTHORIZED,
    NOT_FOUND, 
    CONFLICT, 
    UNPROCESSABLE_ENTITY, 
    INTERNAL_SERVER_ERROR, 
    SERVICE_UNAVAILABLE 
} = require("../statusCodes");


class UserService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/userinfo 
    async getUserInfo(username, type) {
        const result = await this.#dao.getUser(username, type);//.catch(err => "ErrorDB");

        //if (result === "ErrorDB") 
            //return INTERNAL_SERVER_ERROR("ErrorDB");

        if (!result) 
            return INTERNAL_SERVER_ERROR("User not available");

        return OK({
            id: result.getId(),
            username: result.getEmail(),
            name: result.getName(),
            surname: result.getSurname(),
            type: result.getType()
        });
    }

    // GET /api/suppliers 
    async getAllSuppliers() {
        const result = await this.#dao.getAllUsersOfType("supplier");//.catch(err => "ErrorDB");

        //if (result === "ErrorDB") 
            //return INTERNAL_SERVER_ERROR("ErrorDB");

        const users = [];
        for (let u of result) {
            users.push({
                id: u.getId(),
                name: u.getName(),
                surname: u.getSurname(),
                email: u.getEmail()
            })
        }

        return OK(users);      
    }

    // GET /api/users
    async getAllUsers() {
        const result = await this.#dao.getAllUsers();//.catch(err => "ErrorDB");

        //if (result === "ErrorDB") 
            //return INTERNAL_SERVER_ERROR("ErrorDB");

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

        return OK(users);       
    }

    // POST /api/newUser 
    async createNewUser(name, surname, username, type, password) {
        const user = await this.#dao.getUser(username, type);//.catch(err => "ErrorDB");

        //if (user === "ErrorDB") 
            //return SERVICE_UNAVAILABLE("ErrorDB");

        if (user) 
            return CONFLICT("User already exists");

        const hashedPassword = await encryption.hashPassword(password);
        const result = await this.#dao.storeNewUser(
            new User(null, name, surname, username, type, hashedPassword));//.catch(err => "ErrorDB");

        //if (result === "ErrorDB") 
            //return SERVICE_UNAVAILABLE("ErrorDB");
        
        return CREATED();
    }

    // POST /api/______Sessions
    async login(username, password, type){
        const user = await this.#dao.getUser(username, type);//.catch(err => "ErrorDB");

        //if (user === "ErrorDB") 
            //return INTERNAL_SERVER_ERROR("ErrorDB");

        if (!user) 
            return UNAUTHORIZED("Wrong username");

        const passwordIsOk = await encryption.comparePassword(password, user.getPassword());

        if(!passwordIsOk)
            return UNAUTHORIZED("Wrong password");

        return OK({
            id: user.getId(),
            username: user.getEmail(),
            name: user.getName()
        });
    }

    // POST /api/logout
    async logout(){
        return OK();
    }

    // PUT /api/users/:username
    async updateUserRights(username, oldType, newType) {
        const user = await this.#dao.getUser(username, oldType);//.catch(err => "ErrorDB");

        //if (user === "ErrorDB") 
            //return SERVICE_UNAVAILABLE("ErrorDB");

        if (!user) 
            return NOT_FOUND("User not found");

        const newUser = await this.#dao.getUser(username, newType);//.catch(err => "ErrorDB");

        //if (newUser === "ErrorDB") 
            //return SERVICE_UNAVAILABLE("ErrorDB");

        if (newUser) 
            return UNPROCESSABLE_ENTITY("User already present");

        const result = await this.#dao.updateUser(
            new User(user.getId(), user.getName(), user.getSurname(), user.getEmail(), newType, user.getPassword()));//.catch(err => "ErrorDB");

        if (/*result === "ErrorDB" ||*/ !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return OK();      
    }

    // DELETE /api/users/:username/:type
    async deleteUser(username, type){
        const user = await this.#dao.getUser(username, type);//.catch(err => "ErrorDB");

        //if (user === "ErrorDB") 
            //return SERVICE_UNAVAILABLE("ErrorDB");

        if (!user) 
            return NO_CONTENT(); //UNPROCESSABLE_ENTITY("User not found");

        const result = await this.#dao.deleteUser(user.getId());//.catch(err => "ErrorDB");

        if (/*result === "ErrorDB" ||*/ !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return NO_CONTENT();
    }
}

module.exports = UserService;
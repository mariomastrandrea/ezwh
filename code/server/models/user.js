class User{

    #userType = ['CLERK','CUSTOMER','DELIVERYEMPLOYEE','MANAGER','QUALITYEMPLOYEE','SUPPLIER'];

    #id;
    #name;
    #surname;
    #email;
    #type;
    #password;

    constructor(id,name,surname,email,type,password){
        this.#id=id;
        this.#name=name;
        this.#surname=surname;
        this.#email=email;
        this.#type=type;
        this.#password=password;
    }

    getId = () => this.#id;
    getName = () => this.#name;
    getSurname = () => this.#surname;
    getEmail = () => this.#email;
    getType = () => this.#type;
    getPassword = () => this.#password;

    setType = (type) => this.#type=type;
    setPassword = (password) => this.#password=password;

    toJSON = () => ({
        id: this.getId(),
        name: this.getName(),
        surname: this.getSurname(),
        email: this.getEmail(),
        type: this.getType(),
        password: this.getPassword()
    })
}

module.exports = User;
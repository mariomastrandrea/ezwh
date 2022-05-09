
class User {
    #id;
    #name;
    #surname;
    #email;
    #type;
    #password;

    constructor(name, surname, email, type, password, id = null) {
        this.#id = id;
        this.#name = name;
        this.#surname = surname;
        this.#email = email;
        this.#type = type;
        this.#password = password;
    }

    // getters
    getId = () => this.#id;
    getName = () => this.#name;
    getSurname = () => this.#surname;
    getEmail = () => this.#email;
    getType = () => this.#type;
    getPassword = () => this.#password;

    // setters
    setType = (type) => this.#type = type;
    setPassword = (password) => this.#password = password;

    // to serialize object in JSON format
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
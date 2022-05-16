
const OK = (obj) => ({
    obj: obj,
    code: 200
});

const CREATED = () => ({
    code: 201
});

const NO_CONTENT = () => ({
    code: 204
});

const UNAUTHORIZED = (message) => ({
    error: `Unauthorized${message ? ` - ${message}` : ""}`,
    code: 404
});

const NOT_FOUND = (message) => ({
    error: `Not Found${message ? ` - ${message}` : ""}`,
    code: 404
});

const CONFLICT = (message) => ({
    error: `Conflict${message ? ` - ${message}` : ""}`,
    code: 409
});

const UNPROCESSABLE_ENTITY = (message) => ({
    error: `Unprocessable Entity${message ? ` - ${message}` : ""}`,
    code: 422
});

const INTERNAL_SERVER_ERROR = (message) => ({
    error: `Internal Server Error${message ? ` - ${message}` : ""}`,
    code: 500
});

const SERVICE_UNAVAILABLE = (message) => ({
    error: `Service Unavailable${message ? ` - ${message}` : ""}`,
    code: 503
});

module.exports = {
    OK, 
    CREATED, 
    NO_CONTENT, 
    UNAUTHORIZED,
    NOT_FOUND,
    CONFLICT, 
    UNPROCESSABLE_ENTITY, 
    INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE
}
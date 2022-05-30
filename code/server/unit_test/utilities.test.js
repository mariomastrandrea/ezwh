const { int, isInt, isNum, float } = require("../utilities");
const Item = require("../models/item");

const { hashPassword, comparePassword } = require("../utilityEncryption");

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


describe('utilities.js tests', () => {
    test('int func test', () => {
        expect(int()).toBe(null);
        expect(int(null)).toBe(null);
        expect(int(new Item())).toBe(null);
        expect(int(123)).toBe(123);
        expect(int('abcd')).toBe(NaN);
        expect(int('1234')).toBe(1234);
        expect(int('25')).toBe(25);
        expect(int('25.5')).toBe(NaN);
    });

    test('isInt func test', () => {
        expect(isInt()).toBe(false);
        expect(isInt(2)).toBe(true);
        expect(isInt(null)).toBe(false);
        expect(isInt('25')).toBe(true);
        expect(isInt(25.4)).toBe(false);
        expect(isInt('22.3')).toBe(false);
    });

    test('isNum func test', () => {
        expect(isNum(2345)).toBe(true);
        expect(isNum("")).toBe(false);
    });

    test('float func test', () => {
        expect(float()).toBe(null);
        expect(float(null)).toBe(null);
        expect(float(new Item())).toBe(null);
        expect(float(123)).toBe(123);
        expect(float('abcd')).toBe(NaN);
        expect(float('1234')).toBe(1234);
        expect(float('25')).toBe(25);
        expect(float('25.5')).toBe(25.5);
    });
});

describe('utilityEncryption.js error tests', () => {
    test('hashPassword', async () => {
        expect(await hashPassword(null)).toBe(null);
    });

    test('comparePassword', async () => {
        expect(await comparePassword(null)).toBe(false);
    });
});

describe('statusCodes.js particular tests', () => {
    test('UNAUTHORIZED', () => {
        const res = UNAUTHORIZED();
        expect(res.error).toBe("Unauthorized");
    });

    test('UNAUTHORIZED', () => {
        const res = UNAUTHORIZED('2');
        expect(res.error).toBe("Unauthorized - 2");
    });
    
    test('CONFLICT', () => {
        const res = CONFLICT();
        expect(res.error).toBe("Conflict");
    });

    test('CONFLICT', () => {
        const res = CONFLICT('wow');
        expect(res.error).toBe("Conflict - wow");
    });

    test('UNPROCESSABLE_ENTITY', () => {
        const res = UNPROCESSABLE_ENTITY();
        expect(res.error).toBe("Unprocessable Entity");
    });

    test('UNPROCESSABLE_ENTITY', () => {
        const res = UNPROCESSABLE_ENTITY('wow');
        expect(res.error).toBe("Unprocessable Entity - wow");
    });

    test('INTERNAL_SERVER_ERROR', () => {
        const res = INTERNAL_SERVER_ERROR();
        expect(res.error).toBe("Internal Server Error");
    });

    test('INTERNAL_SERVER_ERROR', () => {
        const res = INTERNAL_SERVER_ERROR('wow');
        expect(res.error).toBe("Internal Server Error - wow");
    });
});



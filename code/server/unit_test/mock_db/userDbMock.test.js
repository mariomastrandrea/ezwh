const UserService = require('../../services/userService');
const dao = require('../mock/mockDbManager');
const User = require('../../models/user');
const encryption = require('../../utilityEncryption');

const userServie = new UserService(dao);

describe('get user info', () => {

    beforeEach(async () => {
        dao.getUser.mockReset()
            .mockReturnValueOnce(null) //404
            //.mockReturnValueOnce('ErrorDB') //500
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1')));
    });

    test('get user info', async () => {
        let res = await userServie.getUserInfo('e1@gmail.com', 'supplier');

        //expect 500 not found
        expect(res.code).toBe(500);
        expect(res.error).toBe('Internal Server Error - User not available');

        //expect 500
        //res = await userServie.getUserInfo('e1@gmail.com', 'supplier');
        //expect(res.code).toBe(500);

        //expect 200
        res = await userServie.getUserInfo('e1@gmail.com', 'supplier');
        expect(res.code).toBe(200);
        expect(res.obj.id).toEqual(1);
        expect(res.obj.name).toEqual('N1');
        expect(res.obj.surname).toEqual('S1');
        expect(res.obj.username).toEqual('e1@gmail.com');
        expect(res.obj.type).toEqual('supplier');
    });
})

describe('get all suppliers', () => {

    beforeEach(async () => {
        dao.getAllUsersOfType.mockReset()
            //.mockReturnValueOnce('ErrorDB') //500
            .mockReturnValueOnce([
                new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1')),
                new User(2, 'N2', 'S2', 'e2@gmail.com', 'supplier', await encryption.hashPassword('pass2')),
                new User(3, 'N3', 'S3', 'e3@gmail.com', 'supplier', await encryption.hashPassword('pass3'))
            ]); //200
    });

    test('get all suppliers', async () => {
        let res = await userServie.getAllSuppliers();

        //expect 500
        //expect(res.code).toBe(500);

        //expect 200
        //res = await userServie.getAllSuppliers();
        expect(res.code).toBe(200);
        expect(res.obj).toBeInstanceOf(Array);
    });
})

describe('get all users', () => {

    beforeEach(async () => {
        dao.getAllUsers.mockReset()
            //.mockReturnValueOnce('ErrorDB') //500
            .mockReturnValueOnce([
                new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1')),
                new User(2, 'N2', 'S2', 'e2@gmail.com', 'clerk', await encryption.hashPassword('pass2')),
                new User(3, 'N3', 'S3', 'e3@gmail.com', 'customer', await encryption.hashPassword('pass3'))
            ]); //200
    });

    test('get all users', async () => {
        let res = await userServie.getAllUsers();

        //expect 500
        //expect(res.code).toBe(500);

        //expect 200
        //res = await userServie.getAllUsers();
        expect(res.code).toBe(200);
        expect(res.obj).toBeInstanceOf(Array);
        for (let u of res.obj) {
            expect(res.obj.type).not.toEqual('manager');
        }
    });
})

describe('create new user', () => {

    beforeEach(async () => {
        dao.getUser.mockReset()
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //409
            //.mockReturnValueOnce(null) //503
            .mockReturnValueOnce(null) //201

        dao.storeNewUser.mockReset()
            //.mockReturnValueOnce('ErrorDB') //503
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))); //201
    });

    test('create new user', async () => {
        let res = await userServie.createNewUser('N1', 'S1', 'e1@gmail.com', 'supplier', 'pass1');

        //expect 409
        expect(res.code).toBe(409);

        //expect 503
        //res = await userServie.createNewUser('N1', 'S1', 'e1@gmail.com', 'supplier', 'pass1');
        //expect(res.code).toBe(503);

        //expect 201
        res = await userServie.createNewUser('N1', 'S1', 'e1@gmail.com', 'supplier', 'pass1');
        expect(res.code).toBe(201);
        const newUser = new User(null, 'N1', 'S1', 'e1@gmail.com', 'supplier', 'pass1');
        expect(dao.storeNewUser.mock.calls[0][0].getId()).toEqual(newUser.getId());
        expect(dao.storeNewUser.mock.calls[0][0].getName()).toEqual(newUser.getName());
        expect(dao.storeNewUser.mock.calls[0][0].getSurname()).toEqual(newUser.getSurname());
        expect(dao.storeNewUser.mock.calls[0][0].getEmail()).toEqual(newUser.getEmail());
        expect(dao.storeNewUser.mock.calls[0][0].getType()).toEqual(newUser.getType());
        expect(await encryption.comparePassword(newUser.getPassword(), dao.storeNewUser.mock.calls[0][0].getPassword())).toEqual(true);
    });
})

describe('login', () => {

    beforeEach(async () => {
        dao.getUser.mockReset()
            //.mockReturnValueOnce('ErrorDB') //500
            .mockReturnValueOnce(null) //401 wrong username
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass2'))) //401 wrong password
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //200
    });

    test('login', async () => {
        let res = await userServie.login('e1@gmail.com', 'pass1', 'supplier');

        //expect 500
        //expect(res.code).toBe(500);

        //expect 401 wrong username
        //res = await userServie.login('e1@gmail.com', 'pass1', 'supplier');
        expect(res.code).toBe(401);
        expect(res.error).toBe('Unauthorized - Wrong username');

        //expect 401 wrong pw
        res = await userServie.login('e1@gmail.com', 'pass1', 'supplier');
        expect(res.code).toBe(401);
        expect(res.error).toBe('Unauthorized - Wrong password');

        //expect 200
        res = await userServie.login('e1@gmail.com', 'pass1', 'supplier');
        expect(res.code).toBe(200);
        expect(res.obj.id).toEqual(1);
        expect(res.obj.username).toEqual('e1@gmail.com');
        expect(res.obj.name).toEqual('N1');
    });
})

describe('logout', () => {

    test('logout', async () => {
        let res = await userServie.logout();

        //expect 200
        expect(res.code).toBe(200);
    });
})

describe('update user rights', () => {

    beforeEach(async () => {
        dao.getUser.mockReset()
            .mockReturnValueOnce(null) //404 user not found

            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //422 user already present
            .mockReturnValueOnce(new User(2, 'N1', 'S1', 'e1@gmail.com', 'clerk', await encryption.hashPassword('pass2')))

            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //503
            .mockReturnValueOnce(null)

            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //200
            .mockReturnValueOnce(null);

        dao.updateUser.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //200
    });

    test('update user rights', async () => {
        let res = await userServie.updateUserRights('e1@gmail.com', 'supplier', 'clerk');

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await userServie.updateUserRights('e1@gmail.com', 'supplier', 'clerk');
        expect(res.code).toBe(422);

        //expect 503
        res = await userServie.updateUserRights('e1@gmail.com', 'supplier', 'clerk');
        expect(res.code).toBe(503);

        // expect 200
        res = await userServie.updateUserRights('e1@gmail.com', 'supplier', 'clerk');
        expect(res.code).toBe(200);
        const newUser = new User(1, 'N1', 'S1', 'e1@gmail.com', 'clerk', 'pass1');
        expect(dao.updateUser.mock.calls[0][0].getId()).toEqual(newUser.getId());
        expect(dao.updateUser.mock.calls[0][0].getName()).toEqual(newUser.getName());
        expect(dao.updateUser.mock.calls[0][0].getSurname()).toEqual(newUser.getSurname());
        expect(dao.updateUser.mock.calls[0][0].getEmail()).toEqual(newUser.getEmail());
        expect(dao.updateUser.mock.calls[0][0].getType()).toEqual(newUser.getType());
        expect(await encryption.comparePassword(newUser.getPassword(), dao.updateUser.mock.calls[0][0].getPassword())).toEqual(true);
    });
})

describe('delete user', () => {

    beforeEach(async () => {
        dao.getUser.mockReset()
            .mockReturnValueOnce(null) //204 user not found
            .mockReturnValueOnce(new User(1, 'N1', 'S1', 'e1@gmail.com', 'supplier', await encryption.hashPassword('pass1'))) //503
            .mockReturnValueOnce(new User(2, 'N1', 'S1', 'e1@gmail.com', 'clerk', await encryption.hashPassword('pass2'))) //204

        dao.deleteUser.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //204
    });

    test('delete user', async () => {
        let res = await userServie.deleteUser('e1@gmail.com', 'supplier');

        //expect 204 user not found
        expect(res.code).toBe(204);

        //expect 503
        res = await userServie.deleteUser('e1@gmail.com', 'supplier');
        expect(res.code).toBe(503);

        // expect 204
        res = await userServie.deleteUser('e1@gmail.com', 'supplier');
        expect(res.code).toBe(204);
    });
})
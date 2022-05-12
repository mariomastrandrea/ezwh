const User = require('../models/user');
const DbManager = require('../db/dbManager2');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.log(error);
    }
    return null;
};

const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.log(error);
    }
    return false;
};


const DbManagerInstance = new DbManager();

async function getUserInfo(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        //todo for current user
        //console.log(await hashPassword('pass1'));
        //console.log(await comparePassword('pass1',await hashPassword('pass1')));
        const us = await DbManagerInstance.getUser('e1@gmail.com', 'pass1');
        return res.status(200).send({
            id: us.getId(),
            username: us.getEmail(),
            name: us.getName(),
            surname: us.getSurname(),
            type: us.getType()
        })
    } catch (err) {
        //console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getAllSuppliers(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const users = [];
        const us = await DbManagerInstance.getAllUsersOfType('SUPPLIER');
        for (let u of us) {
            users.push({
                id: u.getId(),
                name: u.getName(),
                surname: u.getSurname(),
                email: u.getEmail()
            })
        }
        return res.status(200).send(users);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getAllUsers(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const users = [];
        const us = await DbManagerInstance.getAllUsers();
        for (let u of us) {
            users.push({
                id: u.getId(),
                name: u.getName(),
                surname: u.getSurname(),
                email: u.getEmail(),
                type: u.getType()
            })
        }
        return res.status(200).send(users);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function createNewUser(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        const schema = Joi.object({
            username: Joi.string().email().required(),
            name: Joi.string().required(),
            surname: Joi.string().required(),
            password: Joi.string().min(8).required(),
            type: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const users = await DbManagerInstance.getAllUsers();
        for (let u of users) {
            if (u.getEmail() === req.body.username && u.getType() === req.body.type)
                return res.status(409).send('User already exists');
        }

        const password = await hashPassword(req.body.password);
        const us = await DbManagerInstance.storeNewUser(new User(req.body.name, req.body.surname, req.body.username, req.body.type, password));
        if (!us)
            return res.status(500).send('Could not store user');

        return res.status(201).send('Created');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function updateUserRights(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().email().required().validate(req.params.username).error) {
            return res.status(422).send('Invalid username')
        }

        const schema = Joi.object({
            newType: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required(),
            oldType: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const users = await DbManagerInstance.getAllUsers();
        var userToUpd = undefined;
        for (let u of users) {
            if (u.getEmail() === req.params.username && u.getType() === req.body.oldType)
                userToUpd = u;
        }
        if (!userToUpd) {
            return res.status(404).send('User not found');
        }

        const count = await DbManagerInstance.updateUser(new User(userToUpd.getName(), userToUpd.getSurname(), userToUpd.getEmail(), req.body.newType, userToUpd.getPassword(), userToUpd.getId()));
        if (count === 0)
            return res.status(500).send('Could not update user');

        return res.status(200).send('Updated');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function deleteUser(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().email().required().validate(req.params.username).error) {
            return res.status(422).send('Invalid username')
        }

        if (Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required().validate(req.params.type).error) {
            return res.status(422).send('Invalid type')
        }

        const users = await DbManagerInstance.getAllUsers();
        var id = undefined;
        for (let u of users) {
            if (u.getEmail() === req.params.username && u.getType() === req.params.type)
                id = u.getId();
        }
        if (!id) {
            return res.status(404).send('User not found');
        }

        const count = await DbManagerInstance.deleteUser(id);
        if (count === 0)
            return res.status(500).send('Could not delete user');

        return res.status(200).send('Deleted user');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getUserInfo,
    getAllSuppliers,
    getAllUsers,
    createNewUser,
    updateUserRights,
    deleteUser
};
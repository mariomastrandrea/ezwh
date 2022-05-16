const express = require('express');
const router = express.Router();
const Joi = require('joi');

// DbManager / DAO
const DbManager = require('../db/dbManager');
const dao = DbManager();

// import Service and inject dao
const UserService = require("../services/userService");
const userService = new UserService(dao);


// GET /api/userinfo - getUserInfo
router.get('/userinfo', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        //todo for current user
        const { code, obj, error } = await userService.getUserInfo('e1@gmail.com', 'CLERK');

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// GET /api/suppliers - getAllSuppliers
router.get('/suppliers', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { code, obj, error } = await userService.getAllSuppliers();

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// GET /api/users - getAllUsers
router.get('/users', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { code, obj, error } = await userService.getAllUsers();

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// POST /api/newUser - createNewUser
router.post('/newUser', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate request body
        const schema = Joi.object({
            username: Joi.string().email().required(),
            name: Joi.string().required(),
            surname: Joi.string().required(),
            password: Joi.string().min(8).required(),   // password length >= 8
            type: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { username, name, surname, password, type } = req.body;
        const { code, error } = await userService.createNewUser(name, surname, username, type, password);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();

    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

// POST /api/managerSessions - login
router.post('/managerSessions', async (req, res) => {
    return await session(req, res, 'manager');
});

// POST /api/customerSessions - login
router.post('/customerSessions', async (req, res) => {
    return await session(req, res, 'customer');
});

// POST /api/supplierSessions - login
router.post('/supplierSessions', async (req, res) => {
    return await session(req, res, 'supplier');
});

// POST /api/clerkSessions - login
router.post('/clerkSessions', async (req, res) => {
    return await session(req, res, 'clerk');
});

// POST /api/qualityEmployeeSessions - login
router.post('/qualityEmployeeSessions', async (req, res) => {
    return await session(req, res, 'qualityEmployee');
});

// POST /api/deliveryEmployeeSessions - login
router.post('/deliveryEmployeeSessions', async (req, res) => {
    return await session(req, res, 'deliveryEmployee');
});

// utility function used by all session POST APIs
async function session(req, res, type) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate request body
        const schema = Joi.object({
            username: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { username, password } = req.body;
        const { code, obj, error } = await userService.login(username, password, type);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
}

// POST /api/logout
router.post('/logout', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // TODO: perform logout       
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// PUT /api/users/:username - updateUserRights
router.put('/users/:username', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().email().required().validate(req.params.username).error) {
            return res.status(422).send('Invalid username');
        }

        const schema = Joi.object({
            newType: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required(),
            oldType: Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier').required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { code, error } =
            await userService.updateUserRights(req.params.username, req.body.oldType, req.body.newType);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

// DELETE /api/users/:username/:type - deleteUser
router.delete('/users/:username/:type', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameters
        const { username, type } = req.params;

        if (Joi.string().email().required().validate(username).error) {
            return res.status(422).send('Invalid username')
        }

        if (Joi.string().valid('customer', 'qualityEmployee', 'clerk', 'deliveryEmployee', 'supplier')
            .required().validate(type).error) {
            return res.status(422).send('Invalid type')
        }

        const { code, error } = await userService.deleteUser(username, type);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

// module export
module.exports = router;
const express = require('express')
const router = express.Router()

const { 
    getUserInfo,
    getAllSuppliers,
    getAllUsers,
    createNewUser,
    updateUserRights,
    deleteUser
} = require('../controller/users')

router.get('/userinfo', getUserInfo)
router.get('/suppliers', getAllSuppliers)
router.get('/users', getAllUsers)

router.post('/newUser', createNewUser)
//todo post sessions,login,logout

router.put('/users/:username', updateUserRights)

router.delete('/users/:username/:type', deleteUser)

module.exports = router
const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const fs = require('fs');


const router = express.Router();

/*router.param('id', (req, res, next, val) => {
    console.log(`User id is: ${val}`);
    next();
})*/

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;
const express = require('express');
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    auth,
} = require('../controllers/authController');
const {
    getAllUsers,
    addUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
} = require('../controllers/userController');
const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', auth, updatePassword);
router.patch('/updateMe', auth, updateMe);

router.route('/').get(getAllUsers).post(addUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
const express = require('express');
const {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    auth,
    restrictTo,
} = require('../controllers/authController');
const {
    getAllUsers,
    addUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
} = require('../controllers/userController');
const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(auth);

router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me', getMe, getUser);

router.use(auth, restrictTo('admin'));

router.route('/').get(getAllUsers).post(addUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
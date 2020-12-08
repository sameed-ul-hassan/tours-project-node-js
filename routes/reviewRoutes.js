const express = require('express');
const {
    getAllReviews,
    addReviews,
    setTourUserId,
    getReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

const { auth, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(auth);

router
    .route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourUserId, addReviews);

router
    .route('/:id')
    .get(getReview)
    .patch(restrictTo('admin', 'user'), updateReview)
    .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
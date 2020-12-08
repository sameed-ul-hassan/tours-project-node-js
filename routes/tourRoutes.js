const express = require('express');
const { auth, restrictTo } = require('../controllers/authController');
const {
    getAllTours,
    addTour,
    getTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    toursStats,
    monthlyPlan,
    getToursWithin,
    getTourInDistance,
    // checkID,
    // checkBody,
} = require('../controllers/tourController');

const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

// router.param('id', checkID);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(toursStats);
router
    .route('/monthly-plan/:year')
    .get(auth, restrictTo('admin', 'lead-guid', 'guide'), monthlyPlan);

router
    .route('/tours-within/:distance/:center/:latlng/unit/:unit')
    .get(getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(getTourInDistance);

router
    .route('/')
    .get(getAllTours)
    .post(auth, restrictTo('admin', 'lead-guide'), addTour);
router
    .route('/:id')
    .get(getTour)
    .patch(auth, restrictTo('admin', 'lead-guide'), updateTour)
    .delete(auth, restrictTo('admin', 'lead-guide'), deleteTour);
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
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
    // checkID,
    // checkBody,
} = require('../controllers/tourController');
const router = express.Router();

// router.param('id', checkID);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(toursStats);
router.route('/monthly-plan/:year').get(monthlyPlan);

router.route('/').get(auth, getAllTours).post(addTour);
router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(auth, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;

//const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory')


//@desc get a tours reviews
// url api/v1/tours/:tourId/reviews
// method GET
// Public


exports.setTourUserIds = (req, res, next) => {
    //Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

// api/v1/review/:tourId/

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review)

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
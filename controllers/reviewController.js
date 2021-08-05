
const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');



exports.getAllReviews = catchAsync( async (req, res, next) => {
    const reviews = await Review.find();
    // query.sort().select().skip().limit()

    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
});


// api/v1/review/:tourId/

exports.createReview = catchAsync(async (req, res, next) => {



    //Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;


    const {
        review,
        rating,
        user,
        tour
    } = req.body


    const newReview = await Review.create({
        review ,
        rating,
        user,
        tour
    });

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});
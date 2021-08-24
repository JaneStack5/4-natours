
const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory')


//@desc get a tours reviews
// url api/v1/tours/:tourId/reviews
// method GET
// Public
exports.getAllReviews = catchAsync( async (req, res, next) => {
    let filter = {};

    const {tourId} = req.params
    const {} = req.body

    //if (req.params.tourId) filter = { tour: req.params.tourId };
    if (tourId) filter = { tour: tourId };

    console.log(filter)

    const reviews = await Review.find(filter);
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

exports.deleteReview = factory.deleteOne(Review);
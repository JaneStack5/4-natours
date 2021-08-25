const mongoose = require('mongoose');
const Tour = require('./toursModel');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review is required']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    tour:  {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user:  {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }


}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})


reviewSchema.pre(/^find/, function (next) {
/*    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo '
    })
    ;*/
    this.populate({
        path: 'user',
        select: 'name photo '
    })
    next()
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                 nRating: { $sum: 1},
                avgRating: {$avg: '$rating'}
    }
        }
    ])
    console.log(stats);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage:  stats[0].avgRating
    });
};

reviewSchema.post("save", function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
} )


module.exports = mongoose.model('Review', reviewSchema)
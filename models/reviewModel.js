const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review is required'],
        minlength: [10, 'a review should have a minimum length of 10'],
        maxlength: [40, 'a review should have a maximum length of 40']

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
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo '
    })
    ;
    next()

})


module.exports = mongoose.model('Review', reviewSchema)
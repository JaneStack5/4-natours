const mongoose = require('mongoose');

const bookingSchema = new moongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a Tour!']
    },
    price: {
        type: Number,
        required: [true, 'Booking must belong to a Tour!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
this.populate('user').populate({
    path: 'tour',
    select: 'name'
});
});

const booking = mongoose.model('booking', bookingSchema);

module.exports = booking;
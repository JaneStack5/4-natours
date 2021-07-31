
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global  Middlewares

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour!'
});
app.use('/api', limiter)

app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

//creating middleware

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);

    next();
})


//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;

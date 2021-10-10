const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user.id);

//remove password from output when created
    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httponly: true,
        secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    });

    // Remove Password From Output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const data = {
        url: `${req.protocol}://${req.get('host')}`,
    }

   // console.log(data)

    await new Email(newUser, data).sendWelcome();


    createSendToken(newUser, 201, req, res)

});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) check if user exists && password is correct
    const user = await User.findOne({ email}).select('+password');


    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('incorrect email or password', 401))
    }

    // 3) if everything is ok, send token to client
    createSendToken(user, 202, req,res)
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check its existence
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }



    if(!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access', 401))
    }


    // 2) verification of token
   const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    // 3) check if user still exist
     const freshUser = await User.findById(decoded.id);
     if(!freshUser) {
         return  next(
             new AppError('The user with this token no longer exist.', 401)
         )
     }

    // 4) check if user changed password after token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }
 // Grant access to protected route
    req.user = freshUser;

    next()
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
     // roles ['admin', 'lead-guide'].role='user'
     if(!roles.includes(req.user.role)) {
         return next(
             new AppError('You do not have permision to perform this action', 403)
         );
     }
     next();
    }
};

exports.forgotPassword = catchAsync( async(req, res, next) => {
    // 1)Get user based on posted email
    const user = await User.findOne({ email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with this email address.', 404));
    }

    // 2) Generate the random rest toke
    const resetToken = await user.createPasswordResetToken();

   // console.log('Token', resetToken)

    await user.save( {validateBeforeSave: false});

    // 3) Send it to users email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;


    const data = {
        url: resetURL
    }

    try {

        await new Email(user, data).sendPasswordReset();

        res.status(200).json({
            status: 'Success',
            message: 'Token sent to email!'
        });
    } catch(e) {

        //console.log(e)

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save( {validateBeforeSave: false});

        return next(
          new AppError('There was an error sending the email, Try again later!', 500)
        )

    }
})

 exports.resetPassword =catchAsync(async (req, res, next) => {
    // 1) Get user based on the token


    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now()}
    });

    // 2) if token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) update changePasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res)
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection


    const user = await User.findById(req.user.id).select('+password');

    // 2) Check in posted current password is correct
    if (!(user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401))
    }

    // 3) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // user.findByIdAndUpdate will Not work as intended!


    // 4) Log user in, send JWT
    createSendToken(user, 200, res);

})


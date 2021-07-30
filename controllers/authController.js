const { promisify } = require('util')
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
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

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
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
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
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
    };
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
    await user.save( {validateBeforeSave: false});

    // 3) Send it to users email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your password 
    and passwordConfirm to: ${resetURL}.\n if you didnt forget your password, please ignore this email`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'Success',
            message: 'Token sent to email!'
        });
    } catch(e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save( {validateBeforeSave: false});

        return next(
          new AppError('There was an error sending the email, Try again later!', 500)
        )

    }
})

exports.resetPassword = (req, res, next) => {}
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
        process.exit(1);
})


const connectDb = async () => {

    const DB = process.env.DATABASE_URL_WRONG_CRED

        const connect = await mongoose.connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })

        console.log(`DB CONNECTED: ${connect.connection.host}`)
    }

    process.on('unhandledRejection', err => {
        console.log('UNHANDELED REJECTION! Shutting down...');
        console.log(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    })



module.exports = connectDb
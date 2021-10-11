
const connectDb = require('./config/db')
const dotenv = require('dotenv');

dotenv.config({path: './config.env'})

const app = require('./app');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
     process.exit(1);
})

//Db connection
connectDb()




//console.log(app.get('env'))

//node env variables
//console.log(process.env)

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDELED REJECTION! Shutting down...');
    console.log(err.name, err.message);
     server.close(() => {
         process.exit(1);
     });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM RECIVED, Shoutting down gracefully');
    server.close(() => {
       console.log('Process terminated!;')
    });
});



//TEST
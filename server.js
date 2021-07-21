
const connectDb = require('./config/db')
const dotenv = require('dotenv');

dotenv.config({path: './config.env'})

const app = require('./app');

//Db connection
connectDb()


//console.log(app.get('env'))

//node env variables
//console.log(process.env)

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

//TEST
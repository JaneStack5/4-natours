const fs = require('fs');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const Tour = require('./../../models/toursModel');

dotenv.config({path: './../../../config.env'})
//dotenv.config({path: '../../../config.env'})

//Db connection


    const DB = 'mongodb://localhost:27017/natours-test'

    mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
        .then(con => console.log(`DB CONNECTED: ${con.connection.host}`))





 // READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data Successfully loaded!')
    } catch(err) {
        console.log(err)
    }
    process.exit();
};

//DELETE ALL DATA FROM DATA BASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data Successfully deleted!')
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

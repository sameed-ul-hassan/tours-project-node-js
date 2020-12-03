const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/Tour');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection is successfull'));

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const migrateTours = async() => {
    try {
        // console.log(tours);
        await Tour.create(tours);
        console.log('Succeessfully migrated');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

const deleteTours = async() => {
    try {
        await Tour.deleteMany();
        console.log('Succeessfully deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

// For importing data :  node dev-data/data/tourMigration.js  --import
// For deleting data :  node dev-data/data/tourMigration.js  --delete
if (process.argv[2] === '--import') {
    migrateTours();
} else if (process.argv[2] === '--delete') {
    deleteTours();
}
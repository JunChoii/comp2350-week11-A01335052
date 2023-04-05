const router = require('express').Router();
const database = include('databaseConnection');
const ObjectId = require('mongodb').ObjectId;

const crypto = require('crypto');
const {v4: uuid} = require('uuid');

const Joi = require("joi");

const passwordPepper = "SeCretPeppa4MySal+";

const idSchema = Joi.string().max(10).required();

const addUserSchema = Joi.object({
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required()
});

router.get('/', async (req, res) => {
    console.log("page hit");
    try {
        const userCollection = database.db('lab_example').collection('users');
        const users = await userCollection.find().project({first_name: 1, last_name: 1, email:
        1, _id: 1}).toArray();
        if (users === null) {
            res.render('error', {message: 'Error connecting to MongoDB'});
            console.log("Error connecting to userModel");
        }
        else {
            console.log(users);
            res.render('index', {allUsers: users});
        }
    }
    catch(ex) {
        res.render('error', {message: 'Error connecting to MongoDB'});
        console.log("Error connecting to MongoDB");
        console.log(ex);
    }
});

router.get('/pets', async (req, res) => {
    console.log("page hit");
    try {
        const petCollection = database.db('lab_example').collection('pets');
        const pets = await petCollection.find({"_id": ObjectId("606e98ba4526b5d688a88c0f")}).toArray();

        if (pets === null) {
            res.render('error', {message: 'Error connecting to MongoDB'});
            console.log("Error connecting to userModel");
        }
        else {
            console.log(pets);
            res.render('pets', {allPets: pets});
        }
    }
    catch(ex) {
        res.render('error', {message: 'Error connecting to MongoDB'});
        console.log("Error connecting to MongoDB");
        console.log(ex);
    }
});

router.get('/showPets', async (req, res) => {
    console.log("page hit");
    try {
        let userId = req.query.id;
        const validationResult = idSchema.validate(userId);
        if (validationResult.error != null) {
            console.log(validationResult.error);
            throw validationResult.error;
        }

        // Add the code to retrieve user's pets here

        res.render('pets', {allPets: pets});
    }
    catch(ex) {
        res.render('error', {message: 'Error connecting to MongoDB'});
        console.log("Error connecting to MongoDB");
        console.log(ex);
    }
});

router.get('/deleteUser', async (req, res) => {
    try {
        console.log("delete user");

        const validationResult = idSchema.validate(req.query.id);
        if (validationResult.error != null) {
            console.log(validationResult.error);
            throw validationResult.error;
        }

        // Add the code to delete the user here

        res.redirect("/");
    }
    catch (ex) {
        res.render('error', {message: 'Error connecting to MongoDB'});
        console.log("Error connecting to MongoDB");
        console.log(ex);    
    }
});

router.post('/addUser', async (req, res) => {
    try {
        console.log("form submit");

        const validationResult = addUserSchema.validate(req.body);
        if (validationResult.error != null) {
            console.log(validationResult.error);
            throw validationResult.error;
        }

        const password_salt = crypto.createHash('sha512');
        password_salt.update(uuid());
        const salt = password_salt.digest('hex');

        const password_hash = crypto.createHash('sha512');
        password_hash.update(req.body.password + passwordPepper + salt);
        const hash = password_hash.digest('hex');

        const userCollection = database.db('lab_example').collection('users');
        await userCollection.insertOne({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password_salt: salt,
            password_hash: hash
        });

        res.redirect("/");
    }
    catch (ex) {
        res.render('error', {message: 'Error connecting to MongoDB'});
        console.log("Error connecting to MongoDB");
        console.log(ex);
    }
});


module.exports = router;
const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require("dotenv").config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvayw.mongodb.net/tourist_club?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("tourist_club");
        const tourCollection = database.collection("tours");
        const bookingCollection = database.collection("bookings");
        // const myBookingCollection = database.collection("mybookings");

        //get api
        app.get('/tours', async (req, res) => {
            const cursor = tourCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });
        //get single tour api
        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tour = await tourCollection.findOne(query);
            //console.log('load single tour with id: ', id);
            res.send(tour);
        })
        //post api for tour adding
        app.post('/tours', async (req, res) => {
            const newTour = req.body;
            const result = await tourCollection.insertOne(newTour);

            //console.log('got new tour', req.body)
            //console.log('added tour', result);
            res.json(result);
        })
        //post api to get all booking
        app.post("/addBooking", async (req, res) => {
            //console.log(req.body);
            const result = await bookingCollection.insertOne(req.body);
            res.send(result);
        });
        // get api for all booking

        app.get("/allBookings", async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            res.send(result);
            //console.log(result);
        });
        // get api of my booking tours

        app.get("/myTours/:email", async (req, res) => {
            const result = await bookingCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });
        //delete api for cancelling my booking
        app.delete('/deleteMyTour/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            console.log(result);
            res.send(result.acknowledged);
        })
        //delete api for deleting from all booking
        app.delete('/allBookings/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            console.log(result);
            res.send(result.acknowledged);
        })
        //get api for approving booking
        app.get('/allBookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.findOne(query);
            console.log('load booking with id: ', result);
            res.send(result);
            //console.log(result)
        })
        //update api for approving booking
        app.put('/allBookings/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const updateBooking = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            //console.log('updating', id)
            res.json(result)
        })
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to assignment-11');
});

app.listen(port, () => {
    console.log('assignment-11 running on port', port);
});
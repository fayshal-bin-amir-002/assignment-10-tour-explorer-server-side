const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${pass}@cluster0.0hiczfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const database = client.db("TourExplorerDB");
        const spotsCollection = database.collection("tourist_spots");
        const countriesCollection = database.collection("countries");

        //get all tourists spots data
        app.get('/touristSpots', async (req, res) => {
            const cursor = spotsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/countrySpots/:country', async (req, res) => {
            const country = req.params.country;
            const query = { country_Name: country };
            const cursor = spotsCollection.find();
            const result = await spotsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/countries', async(req, res) => {
            const cursor = countriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/touristSpots/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotsCollection.findOne(query);
            res.send(result);
        })

        app.get('/mySpots/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await spotsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/sortSpots/:txt', async (req, res) => {
            const txt = req.params.txt;
            if (txt === 'none') {
                const cursor = spotsCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            }
            if (txt === 'high') {
                const cursor = spotsCollection.find();
                const result1 = await cursor.toArray();
                const result = result1.sort((a, b) => {
                    return Number(a.average_cost) - Number(b.average_cost)
                });
                res.send(result);
            }
            if (txt === 'low') {
                const cursor = spotsCollection.find();
                const result1 = await cursor.toArray();
                const result = result1.sort((a, b) => {
                    return Number(b.average_cost) - Number(a.average_cost)
                });
                res.send(result);
            }
        })

        app.post('/touristSpots', async (req, res) => {
            const newSpot = req.body;
            const result = await spotsCollection.insertOne(newSpot);
            res.send(result);
        })

        app.patch('/touristSpots/:id', async (req, res) => {
            const id = req.params.id;
            const updatedSpot = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    image: updatedSpot.image,
                    tourist_spot_name: updatedSpot.tourist_spot_name,
                    country_Name: updatedSpot.country_Name,
                    location: updatedSpot.location,
                    shortdescription: updatedSpot.shortdescription,
                    average_cost: updatedSpot.average_cost,
                    seasonality: updatedSpot.seasonality,
                    travel_time: updatedSpot.travel_time,
                    totalVisitorsPerYear: updatedSpot.totalVisitorsPerYear
                },
            };
            const result = await spotsCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/touristSpots/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotsCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
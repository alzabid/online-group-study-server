const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId, } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongodb URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhhy7ix.mongodb.net/?retryWrites=true&w=majority`;


// Mongodb Connection
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	
    await client.connect();

    const assignmentCollection = client.db("groupStudy").collection("assignments");
    const submitCollection = client.db("groupStudy").collection("submits");


    // assignment api
     app.get("/assignments", async (req, res) => {
       const cursor = assignmentCollection.find();
       const result = await cursor.toArray();
       res.send(result);
     });
     
     app.get("/assignments/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: new ObjectId(id) };
       const result = await assignmentCollection.findOne(query);
       res.send(result);
     });

    app.post("/assignments", async (req, res) => {
      const assignment = req.body;
      console.log(assignment);
      const result = await assignmentCollection.insertOne(assignment);
      res.send(result);
    });
     app.put("/assignments/:id", async (req, res) => {
       const id = req.params.id;
       const filter = { _id: new ObjectId(id) };
       const options = { upsert: true };
       const updateAssignment = req.body;

       const assignment = {
         $set: {
           name: updateAssignment.name,
           marks: updateAssignment.marks,
           category: updateAssignment.category,
           date: updateAssignment.date,
           description: updateAssignment.description,
           level: updateAssignment.level,
           image: updateAssignment.image,
         },
       };

       const result = await assignmentCollection.updateOne(
         filter,
         assignment,
         options
       );
       res.send(result);
     });

    //  submitted api
    app.get("/submits", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await submitCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/submits", async (req, res) => {
      const submit = req.body;
      console.log(submit);
      const result = await submitCollection.insertOne(submit);
      res.send(result);
    });

    app.patch("/submits/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateSubmit = req.body;
      console.log(updateSubmit);
      const updateDoc = {
        $set: {
          status: updateSubmit.status,
        },
      };
      const result = await submitCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

   










    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});

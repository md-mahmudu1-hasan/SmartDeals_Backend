const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const e = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const uri =
  "mongodb+srv://mongo_second_project:dguvGL1PSAcoMfVD@cluster0.6l2dtxw.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    await client.connect();

    const myDB = client.db("products_db");
    const myColl = myDB.collection("products");
    const myProductColl = myDB.collection("myProducts");
    const mybideColl = myDB.collection("bideInfo");

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await myColl.insertMany(newProduct);
      res.send(result);
    });
    app.post("/myProducts", async (req, res) => {
      const newProduct = req.body;
      const result = await myProductColl.insertMany(newProduct);
      res.send(result);
    });
    app.post("/bideInfo", async (req, res) => {
      const newProduct = req.body;
      const result = await mybideColl.insertOne(newProduct);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myColl.deleteOne(query);
      res.send(result);
    });

    app.delete("/products", async (req, res) => {
      const result = await myColl.deleteMany({});
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = {};
      const updatee = req.body;
      const update = {
        $set: updatee,
      };
      const result = await myColl.updateOne(query, update, option);
      res.send(result);
    });

    app.patch("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const option = {};
      const updatee = req.body;
      const update = {
        $set: updatee,
      };
      const result = await myProductColl.updateOne(query, update, option);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const queryEmail = req.query.email;
      let query = {};

      if (queryEmail) {
        query = { email: queryEmail };
      }

      const projects = { title: 1, price_min: 1, image: 1, email: 1 };
      const cursor = myColl
        .find(query)
        .sort({ price_min: 1 })
        .project(projects);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });
    app.get("/myproducts", async (req, res) => {
      const queryEmail = req.query.email;
      let query = {};

      if (queryEmail) {
        query = { email: queryEmail };
      }

      const cursor = myProductColl.find(query).sort({ price_min: 1 });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });
    app.get("/bideInfo", async (req, res) => {
      const queryEmail = req.query.email;
      let query = {};

      if (queryEmail) {
        query = { buyerEmail: queryEmail };
      }

      const cursor = mybideColl.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get("/myproducts/bideInfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { productId: id };
      const cursor = mybideColl.find(query).sort({ bideAmount: -1 });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myColl.findOne(query);
      res.send(result);
    });
    app.get("/myproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myProductColl.findOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

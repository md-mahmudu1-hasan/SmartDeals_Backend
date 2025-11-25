const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const Varifytoken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "forbidden access" });
  }

  jwt.verify(
    token,
    "14e8032c01cf8566dacc03d4694492f09803e6fb06c9d6e8721c7f45ff26ce9a0be913287771c3bc4498bc5a5c6336553fc3d02e5f9c988de20fce4d81c8f1cc",
    (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "forbidden access" });
      }
      req.token_email = decoded.email;
      next();
    }
  );
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri =
  "mongodb+srv://mongo_second_project:dguvGL1PSAcoMfVD@cluster0.6l2dtxw.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const database = client.db("products_db");
    const productsCollection = database.collection("myProducts");
    const bideCollection = database.collection("bideInfo");

    //post method
    app.post("/myproducts", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.post("/bideInfo", async (req, res) => {
      const newBide = req.body;
      const result = await bideCollection.insertOne(newBide);
      res.send(result);
    });

    app.post("/gettoken", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(
        { email: user.email },
        "14e8032c01cf8566dacc03d4694492f09803e6fb06c9d6e8721c7f45ff26ce9a0be913287771c3bc4498bc5a5c6336553fc3d02e5f9c988de20fce4d81c8f1cc",
        { expiresIn: "1h" }
      );
      res.send({ token: token });
    });
    //get method
    app.get("/myproducts", async (req, res) => {
      const cursor = productsCollection.find({}).sort({ price: -1 });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get("/myproducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/bideInfo", Varifytoken, async (req, res) => {
      const queryEmail = req.query.email;
      let query = {};
      if (queryEmail) {
        query = { buyerEmail: queryEmail };
        if (req.token_email !== queryEmail) {
          return res.status(403).send({ message: "forbidden access" });
        }
      }
      const cursor = bideCollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    app.get("/myproducts/bideInfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { productId: id };
      const cursor = bideCollection.find(query).sort({ bideAmount: -1 });
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    //detele method
    app.delete("/bideInfo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bideCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

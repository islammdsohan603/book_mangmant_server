require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// MongoDB Client Setup
const client = new MongoClient(process.env.MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("🎯 Successfully connected to MongoDB Atlas!");

    const booksCollection = client.db("bookmangment").collection("books");

    // API Routes
    app.get("/api/recent-books", async (req, res) => {
      try {
        const result = await booksCollection.find().sort({ rating: -1 }).limit(3).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    });

    app.get("/api/all-books", async (req, res) => {
      try {
        const result = await booksCollection.find().toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    });

    app.get("/api/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await booksCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "Books not found" });
        }
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
}

run();

// Root Route
app.get("/", (req, res) => {
  res.send("Book management API is running...");
});

// Server Listening
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
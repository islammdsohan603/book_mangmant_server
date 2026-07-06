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
    const readebooks = client.db("bookmangment").collection("readebook")

    // API Routes
    app.get("/api/recent-books", async (req, res) => {
      try {
        const result = await booksCollection.find().sort({ rating: -1 }).limit(3).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    });
    // get all book api
    app.get("/api/all-books", async (req, res) => {
      try {
        const result = await booksCollection.find().toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    });
    // single data api
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

    // read book now button api

    app.post("/api/read-book", async (req, res) => {
      try {
        const book = req.body;


        if (!book || !book._id) {
          return res.status(400).send({ message: "Invalid book data provided" });
        }


        const isExist = await readebooks.findOne({ bookId: book._id });

        if (isExist) {

          return res.status(400).send({ message: "This book is already in your bookmarks!" });
        }


        const { _id, ...bookWithoutId } = book;
        const bookToSave = {
          ...bookWithoutId,
          bookId: _id,
          addedAt: new Date()
        };


        const result = await readebooks.insertOne(bookToSave);
        res.status(201).send(result);

      } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send({ message: "Server error while saving the book", error: err.message });
      }
    });

    // read book get api

    app.get("/api/get-read-book", async (req, res) => {
      try {
        const result = await readebooks.find().toArray()
        res.status(201).send(result)
      } catch (err) {
        res.status(500).send({ message: "Error fetching books", error: err });
      }
    })

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
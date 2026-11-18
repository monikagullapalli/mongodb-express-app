
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const MONGO_URI = "mongodb://127.0.0.1:27017";;
const client = new MongoClient(MONGO_URI);
let db;

client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
        db = client.db("bookDB");
    })
    .catch((err) => {
        console.error("Unable to connect MongoDB:", err);
    });

// POST: Add a new book
app.post("/api/v1/books", (req, res, next) => {
    const { title, author, category, publishedYear } = req.body;

    db.collection("books")
        .insertOne({ title, author, category, publishedYear })
        .then((result) => {
            res.status(201).json({
                message: "Book added successfully",
                data: {
                    _id: result.insertedId,...req.body
                }
            });
        })
        .catch((err)=>{
            err.message="Book added successfully";
            throw err;
        });
});

// GET: Retrieve all books
app.get("/api/v1/books", (req, res) => {
    const {category}=req.query;
    const query=category?{category}:{};
    db.collection("books")
        .find(query)
        .toArray()
        .then((books) => {
            res.status(200).json({
                message: "Books fetched successfully",
                data: books
            });
        })
        .catch((err)=>{
            err.message="Failed to fetch books";
            throw err;
        });
});

// GET: Retrieve a book by ID
app.get("/api/v1/books/:id", (req, res) => {
    const id = req.params;
    db.collection("books")
        .findOne({ _id: new ObjectId(id) })
        .then((book) => {
            if (!book) {
                res.status(404).json({
                    message: "Book not found"
                });
            }
            else{
                res.status(200).json({
                message: "Book fetched successfully",
                data: book
                });
            }
        })
        .catch((err)=>{
            err.message="failed to fetch books";
            throw err;
        });
});

// PUT: Update a book by ID
app.put("/api/v1/books/:id", (req, res) => {
    const {id}= req.params;
    const { title, author, category, publishedYear } = req.body;
    db.collection("books")
        .updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, author, category, publishedYear } }
        )
        .then((result) => {
            if (result.matchedCount === 0) {
                res.status(404).json({
                    message: "Book not found"
                });
            }else{
                res.status(200).json({message:"Book updated successfully",data:{_id:new ObjectId(id),...req.body}});
            }
        })
        .catch((err)=>{
            err.message="Failed to update book";
            throw err;
        });
});

// DELETE: Remove a book by ID
app.delete("/api/v1/books/:id", (req, res, next) => {
    const {id}=req.params;
    db.collection("books")
        .deleteOne({ _id: new ObjectId(id) })
        .then((result) => {
            if (result.deletedCount === 0) {
                res.status(404).json({
                    message: "Book not found"
                });
            }else{
                res.status(200).json({message:"Book deleted suucessfully"});
            }
        })
        .catch((err)=>{
            err.message="failed to delete books";
            throw err;
        });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    const status=err.statusCode || 500;
    const message=err.message || "Internal Server error";
    res.status(status).json({message});
});
const PORT=process.env.PORT || 7000;
app.listen(PORT,()=>{
    console.log(`server runnning at http://localhost:${PORT}`);
})
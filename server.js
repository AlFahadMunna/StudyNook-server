import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).send("Forbidden");
  }
};

async function run() {
  try {
    // await client.connect();

    const db = client.db("study-nook");
    const roomsCollection = db.collection("rooms");
    const bookingCollection = db.collection("booking");
    const userCollection = db.collection("user");

    // create room

    app.post("/rooms", async (req, res) => {
      try {
        const body = req.body;

        if (Object.keys(body).length === 0) {
          return res.status(400).json({
            success: false,
            message: "Provide valid data",
          });
        }

        const newRoom = {
          ...body,
          bookingCount: 0,
          createdAt: new Date(),
        };

        const result = await roomsCollection.insertOne(newRoom);

        return res.status(201).json({
          success: true,
          message: "Room created successfully",
          data: result,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
}

export default app;

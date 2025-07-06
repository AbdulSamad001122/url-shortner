const express = require("express");
const urlRoute = require("./routes/url");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const path = require("path");

const app = express();
const port = process.env.PORT || 8001;

// Use environment variable for MongoDB connection
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/url-shortner";

connectToMongoDB(MONGO_URL).then(console.log("MongoDB Connected"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (!entry) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.redirect(entry.redirectUrl);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CareerLens AI Backend Running");
});

app.use("/", analysisRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT);
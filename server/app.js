require("dotenv").config();
const express = require("express");
const imageRouter = require("./routes/images.routes");
const gameRouter = require("./routes/games.routes");
const scoreRouter = require("./routes/scores.routers");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const app = express();

app.set("trust proxy", 1);
app.use(cors({origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"}));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use("/api", gameRouter);
app.use("/api", imageRouter);
app.use("/api", scoreRouter);

app.use((req, res, next) =>{
    res.status(404).send("Page not found!");
});

app.use(errorHandler);

const PORT = process.env.PORT || 8070;
app.listen(PORT, err =>{
    if(err)throw err;
    console.log(`Express listening on port: ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const imageRouter = require("./routes/images.routes");
const gameRouter = require("./routes/games.routes");
const scoreRouter = require("./routes/scores.routers");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

app.use(express.urlencoded());

app.use(express.json());

app.use("/api", gameRouter);
app.use("/api", imageRouter);
app.use("/api", scoreRouter);

app.use((req, res, next) =>{
    res.status(404).send("Page not found!");
});

app.use(errorHandler);

const PORT = 8070;
app.listen(PORT, err =>{
    if(err)throw err;
    console.log(`Express listening on port: ${PORT}`);
});
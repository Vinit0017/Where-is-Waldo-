const express = require("express");
const apiRouter = require("./routes/apiRouter");
const errorHandler = require("./middlewares/errors");
const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use((req, res, next) =>{
    res.status(404).send("Page not found!");
});

app.use(errorHandler);

const PORT = 8080;
app.listen(PORT, err =>{
    if(err)throw err;
    console.log(`Express listenign on port: ${PORT}`);
});
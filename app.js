const express = require("express");
const app = express();
const { errorConverter, errorHandler } = require("./middlewares/error");
const notFound = require("./middlewares/not-found");
const { Web3Storage } = require("web3.storage");
const { File } = require("web3.storage");

require("dotenv").config({});

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

const client = new Web3Storage({
  token: process.env.WEB3_STORAGE_API_TOKEN,
});

function makeFileObjects(obj, file_name) {
  const buffer = Buffer.from(JSON.stringify(obj));

  const file = [
    new File(["contents-of-file-1"], "plain-utf8.txt"),
    new File([buffer], `${file_name}.json`),
  ];
  return file;
}

async function storeFiles(file) {
  const cid = await client.put(file);
  return cid;
}

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/storeFile", async (req, res, next) => {
  try {
    const obj = req.body;
    const file_name = req.body.userAddress;
    const file = await makeFileObjects(obj, file_name);
    const cid = await storeFiles(file);
    res.send(cid);
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    app.listen(port, () => console.log(`server is running on ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();

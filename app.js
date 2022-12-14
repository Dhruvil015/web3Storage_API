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
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());
app.use(xss());

const client = new Web3Storage({
  token: process.env.WEB3_STORAGE_API_TOKEN,
});

function makeFileObjects(obj, file_name) {
  const buffer = Buffer.from(JSON.stringify(obj));

  const file = [new File([buffer], `${file_name}.json`)];
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
    const userObj = req.body;
    const file_name = req.body.address;
    const file = await makeFileObjects(userObj, file_name);
    const cid = await storeFiles(file);
    const responseObj = {
      address: file_name,
      cid: cid,
      url: `https://ipfs.io/ipfs/${cid}/${file_name}.json`,
    };
    res.send(JSON.stringify(responseObj));
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    app.listen(port, () => console.log(`server is running on ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();

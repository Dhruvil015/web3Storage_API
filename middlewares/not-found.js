const httpStatus = require("http-status");

const notFound = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND).send("route does not exists!!");
};

module.exports = notFound;

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const errorConverter = (err, req, res, next) => {
  let error = err;
  let statusCode, message;
  if (!(error instanceof ApiError)) {
    if (error.name === "ValidationError") {
      message = Object.values(error.errors)
        .map((item) => item.message)
        .join(",");
      statusCode = 400;
    } else if (error.name === "CastError") {
      message = `No item found with id : ${error.value}`;
      statusCode = 404;
    } else if (error.code === 11000) {
      message = `Duplicate value entered for ${Object.keys(
        err.keyValue
      )} field, please choose another value.`;
      statusCode = 400;
    } else {
      statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      message = error.message || httpStatus[statusCode];
    }
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err;

  res.status(statusCode).json({ msg: message });
};

module.exports = {
  errorConverter,
  errorHandler,
};

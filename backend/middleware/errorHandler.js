// Catches any error passed to next(err) or thrown inside an async route,
// so the server never crashes and the client always gets a JSON response.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Something went wrong. Please try again later.",
  });
}

module.exports = errorHandler;

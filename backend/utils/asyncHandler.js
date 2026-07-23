// Wraps an async controller so thrown errors go to Express's error handler
// instead of crashing the server. Avoids repeating try/catch everywhere.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

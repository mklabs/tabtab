// For node 7 / 8
module.exports = async (promise, error, message = '') => {
  let toThrow;
  await promise().catch(err => {
    if (error instanceof RegExp) {
      const ok = error.test(err.message);
      if (!ok) {
        toThrow = new Error(
          `AssertionError: ${error} is not validated
          ${message}`
        );
      }
    } else {
      const ok = err instanceof error;
      if (!ok) {
        toThrow = new Error(
          `AssertionError: ${err.name} is not an instanceof ${error.name}
          ${message}`
        );
      }
    }
  });

  if (toThrow) {
    throw toThrow;
  }
};

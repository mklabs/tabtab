const fs = require('fs').promises;
const untildify = require('untildify');

module.exports = async file => {
  let fileExists;
  try {
    await fs.readFile(untildify(file));
    fileExists = true;
  } catch {
    fileExists = false;
  }

  return fileExists;
};

const fs = require('fs');
const untildify = require('untildify');
const { promisify } = require('es6-promisify');

const readFile = promisify(fs.readFile);

module.exports = async file => {
  let fileExists;
  try {
    await readFile(untildify(file));
    fileExists = true;
  } catch (err) {
    fileExists = false;
  }

  return fileExists;
};

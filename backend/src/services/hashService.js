const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculates SHA-256 digest from a Buffer in memory
 * @param {Buffer} buffer - Raw file bytes
 * @returns {string} 64-character lowercase hexadecimal hash
 */
const calculateBufferHash = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a valid Buffer');
  }
  return crypto.createHash('sha256').update(buffer).digest('hex').toLowerCase();
};

/**
 * Calculates SHA-256 digest from a file path using streams
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>} 64-character lowercase hexadecimal hash
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = {
  calculateBufferHash,
  calculateFileHash,
};


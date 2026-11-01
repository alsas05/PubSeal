const crypto = require('crypto');

/**
 * Generate a unique, formatted PubSeal Registration ID
 * Example: PUB-2026-B8D4E2F1
 */
const generateRegistrationId = () => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PUB-${year}-${randomHex}`;
};

module.exports = {
  generateRegistrationId,
};


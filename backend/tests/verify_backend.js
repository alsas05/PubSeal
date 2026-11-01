require('dotenv').config();
const mongoose = require('mongoose');
const { calculateBufferHash } = require('../src/services/hashService');
const { generateRegistrationId } = require('../src/utils/idGenerator');
const { generateCertificateBuffer } = require('../src/services/certificateService');
const User = require('../src/models/User');
const Work = require('../src/models/Work');

async function testBackend() {
  console.log('--- Testing PubSeal Backend Core Services ---');

  // 1. Test SHA-256 Hashing
  const testBuffer = Buffer.from('The woods are lovely, dark and deep, but I have promises to keep.', 'utf-8');
  const hash = calculateBufferHash(testBuffer);
  console.log('[PASS] SHA-256 Hashing computed:', hash);
  if (hash.length !== 64) throw new Error('Invalid SHA-256 length');

  // 2. Test Registration ID Generator
  const regId = generateRegistrationId();
  console.log('[PASS] Registration ID format:', regId);
  if (!regId.startsWith('PUB-')) throw new Error('Invalid RegID format');

  // 3. Test Certificate PDF Generation
  console.log('Generating sample certificate PDF in memory...');
  const mockWork = {
    registrationId: regId,
    title: 'Stopping by Woods on a Snowy Evening',
    authorName: 'Robert Frost',
    category: 'Poetry',
    originalFilename: 'frost_manuscript.txt',
    registeredAt: new Date(),
    sha256Hash: hash,
  };
  const pdfBuffer = await generateCertificateBuffer(mockWork, 'http://localhost:5173/verify?token=' + regId);
  console.log('[PASS] Certificate PDF generated successfully. Byte size:', pdfBuffer.length);
  if (pdfBuffer.length < 5000) throw new Error('PDF output seems truncated');

  // 4. Test MongoDB Connection
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pubseal');
  console.log('[PASS] MongoDB connected successfully.');

  await mongoose.disconnect();
  console.log('--- All backend core sanity tests PASSED ---');
}

testBackend().catch((err) => {
  console.error('[FAIL] Backend test failed:', err);
  process.exit(1);
});


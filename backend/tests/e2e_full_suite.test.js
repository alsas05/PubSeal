const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000/api';

async function runFullE2ETestSuite() {
  console.log('=====================================================');
  console.log(' PUBSEAL COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('=====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`[FAIL] ${message}`);
      throw new Error(message);
    }
    passedTests++;
    console.log(`[PASS] ${message}`);
  }

  // Helper for requests
  const api = async (endpoint, options = {}) => {
    const headers = {
      'x-test-suite': 'true',
      ...(options.headers || {}),
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.arrayBuffer();
    }
    return { status: res.status, headers: res.headers, data };
  };

  const testUserA = {
    name: 'Eleanor Vance',
    email: `eleanor_${Date.now()}@testliterary.org`,
    password: 'MasterKeyPass2026!',
  };

  const testUserB = {
    name: 'Arthur Pendelton',
    email: `arthur_${Date.now()}@testliterary.org`,
    password: 'MasterKeyPass2026!',
  };

  let tokenUserA = null;
  let tokenUserB = null;
  let workA = null;

  // ----------------------------------------------------
  // TEST GROUP 1: AUTHENTICATION
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: AUTHENTICATION ---');

  // 1.1: Register User A
  const regRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUserA),
  });
  assert(regRes.status === 201 && regRes.data.success && regRes.data.token, '1.1: User A registration successful with JWT');
  tokenUserA = regRes.data.token;
  assert(!regRes.data.user.passwordHash, '1.1b: Password hash not leaked in registration response');

  // 1.2: Duplicate email registration prevention
  const dupRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUserA),
  });
  assert(dupRes.status === 400 && !dupRes.data.success, '1.2: Duplicate email registration blocked with 400');

  // 1.3: Successful Login
  const loginRes = await api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserA.email, password: testUserA.password }),
  });
  assert(loginRes.status === 200 && loginRes.data.success && loginRes.data.token, '1.3: Login successful with valid credentials');

  // 1.4: Invalid credentials
  const badLoginRes = await api('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserA.email, password: 'WrongPassword123' }),
  });
  assert(badLoginRes.status === 401 && !badLoginRes.data.success, '1.4: Invalid credentials rejected with 401');

  // 1.5: Register User B
  const regBRes = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUserB),
  });
  assert(regBRes.status === 201, '1.5: User B registered successfully');
  tokenUserB = regBRes.data.token;

  // 1.6: Protected route access without token
  const unauthRes = await api('/works', { method: 'GET' });
  assert(unauthRes.status === 401 && !unauthRes.data.success, '1.6: Unauthenticated request rejected with 401');

  // 1.7a: Social Login with Google
  const googleLoginRes = await api('/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      email: `google.author.${Date.now()}@testliterary.org`,
      name: 'Google Author',
      providerId: 'google-uid-12345',
    }),
  });
  assert(
    googleLoginRes.status === 201 &&
    googleLoginRes.data.success &&
    googleLoginRes.data.token &&
    googleLoginRes.data.user.isEmailVerified === true,
    '1.7a: Social login with Google registers and auto-verifies author'
  );

  // 1.7b: Social Login with Facebook for existing user
  const fbLoginRes = await api('/auth/social-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'facebook',
      email: testUserA.email,
      name: testUserA.name,
      providerId: 'fb-uid-67890',
    }),
  });
  assert(
    fbLoginRes.status === 200 &&
    fbLoginRes.data.success &&
    fbLoginRes.data.token &&
    fbLoginRes.data.user.email === testUserA.email,
    '1.7b: Social login with Facebook authenticates existing author seamlessly'
  );

  // ----------------------------------------------------
  // TEST GROUP 2: FILE REGISTRATION & SHA-256 HASHING
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: FILE REGISTRATION & SHA-256 HASHING ---');

  // Prepare a test manuscript file
  const testDir = path.join(__dirname, 'test_artifacts');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const manuscriptPath1 = path.join(testDir, 'cartographer_chapter1.txt');
  const manuscriptContent1 = `Chapter I: The observatory was silent except for the clockwork escapement at ${Date.now()}.`;
  fs.writeFileSync(manuscriptPath1, manuscriptContent1, 'utf8');

  // Authoritatively compute expected SHA-256
  const expectedHash1 = crypto.createHash('sha256').update(Buffer.from(manuscriptContent1, 'utf8')).digest('hex');

  // 2.1: Valid file registration using FormData
  const formData = new FormData();
  formData.append('file', new Blob([fs.readFileSync(manuscriptPath1)], { type: 'text/plain' }), 'cartographer_chapter1.txt');
  formData.append('title', 'The Cartographer of Lost Constellations');
  formData.append('category', 'Novel');
  formData.append('authorName', 'Eleanor Vance');
  formData.append('description', 'A speculative fiction novel exploring stellar cartography.');

  const uploadRes = await api('/works', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: formData,
  });

  assert(uploadRes.status === 201 && uploadRes.data.success, '2.1: Work successfully registered');
  workA = uploadRes.data.work;
  assert(workA.sha256Hash === expectedHash1, `2.1b: SHA-256 hash matches authoritative digest (${expectedHash1})`);
  assert(workA.registrationId && workA.registrationId.startsWith('PUB-'), '2.1c: Registration ID properly generated (PUB-YYYY-...)');

  // 2.2: Unsupported file format rejection
  const badFormData = new FormData();
  badFormData.append('file', new Blob([Buffer.from('fake exe content')], { type: 'application/octet-stream' }), 'malicious.exe');
  badFormData.append('title', 'Bad File');
  badFormData.append('category', 'Novel');

  const badFileRes = await api('/works', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: badFormData,
  });
  assert(badFileRes.status === 400 || badFileRes.status === 500, '2.2: Unsupported extension (.exe) rejected');

  // 2.3: Missing required title field
  const noTitleData = new FormData();
  noTitleData.append('file', new Blob([Buffer.from('content')], { type: 'text/plain' }), 'test.txt');
  noTitleData.append('category', 'Novel');

  const noTitleRes = await api('/works', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: noTitleData,
  });
  assert(noTitleRes.status === 400 && !noTitleRes.data.success, '2.3: Missing title rejected with 400');

  // 2.4: Duplicate submission notification
  const dupUploadRes = await api('/works', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: formData,
  });
  assert(dupUploadRes.status === 201 && dupUploadRes.data.duplicateNotice, '2.4: Duplicate file submission detected with notice');

  // ----------------------------------------------------
  // TEST GROUP 3: FILE INTEGRITY & VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: FILE INTEGRITY & VERIFICATION ---');

  // 3.1: Verify identical file bytes (Exact Match)
  const verifyData1 = new FormData();
  verifyData1.append('file', new Blob([fs.readFileSync(manuscriptPath1)], { type: 'text/plain' }), 'same_file.txt');

  const verifyRes1 = await api('/verification/check', {
    method: 'POST',
    body: verifyData1,
  });

  assert(verifyRes1.status === 200 && verifyRes1.data.match === true, '3.1: Original file verified with EXACT_MATCH');
  assert(
    verifyRes1.data.work.registrationId === workA.registrationId ||
      verifyRes1.data.work.registrationId === dupUploadRes.data.work.registrationId,
    '3.1b: Matched registration ID corresponds to registered work'
  );
  assert(verifyRes1.data.calculatedHash === expectedHash1, '3.1c: Verified calculated hash matches');

  // 3.2: Verify altered file (Single character change)
  const alteredContent = 'Chapter I: The observatory was silent except for the clockwork escapement.'; // Change period to exclamation
  const alteredContentModified = alteredContent.slice(0, -1) + '!';
  const verifyData2 = new FormData();
  verifyData2.append('file', new Blob([Buffer.from(alteredContentModified, 'utf8')], { type: 'text/plain' }), 'altered.txt');

  const verifyRes2 = await api('/verification/check', {
    method: 'POST',
    body: verifyData2,
  });

  assert(verifyRes2.status === 200 && verifyRes2.data.match === false, '3.2: Altered file produces NO_MATCH');
  assert(verifyRes2.data.calculatedHash !== expectedHash1, '3.2b: Altered file hash is completely different');

  // 3.3: Lookup by Registration ID query
  const lookupRes = await api(`/verification/lookup?query=${workA.registrationId}`);
  assert(lookupRes.status === 200 && lookupRes.data.found === true, '3.3: Lookup by Registration ID successful');
  assert(lookupRes.data.work.title === workA.title, '3.3b: Lookup returns accurate title');

  // 3.4: Lookup non-existent token
  const lookupBadRes = await api(`/verification/lookup?query=PUB-9999-NONEXIST`);
  assert(lookupBadRes.status === 200 && lookupBadRes.data.found === false, '3.4: Non-existent token lookup returns found: false');

  // ----------------------------------------------------
  // TEST GROUP 4: CERTIFICATES & DOWNLOADS
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: CERTIFICATES & DOWNLOADS ---');

  // 4.1: Download Certificate PDF
  const certRes = await api(`/works/${workA.registrationId}/certificate/download`);
  assert(certRes.status === 200, '4.1: Certificate PDF download returns 200');
  const certBuffer = Buffer.from(certRes.data);
  assert(certBuffer.subarray(0, 4).toString('ascii') === '%PDF', '4.1b: Generated certificate binary has valid %PDF magic header');
  assert(certBuffer.length > 5000, '4.1c: Generated certificate has substantial content size (>5KB)');

  // 4.2: Certificate Metadata Endpoint
  const certMetaRes = await api(`/works/${workA.registrationId}/certificate`);
  assert(certMetaRes.status === 200 && certMetaRes.data.certificate.sha256Hash === expectedHash1, '4.2: Certificate metadata contains accurate SHA-256 hash');

  // ----------------------------------------------------
  // TEST GROUP 5: AUTHORIZATION & BOUNDARIES
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: AUTHORIZATION & BOUNDARIES ---');

  // 5.1: User A can access own work
  const ownWorkRes = await api(`/works/${workA._id}`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(ownWorkRes.status === 200 && ownWorkRes.data.work._id === workA._id, '5.1: Owner (User A) can view own work');

  // 5.2: User B CANNOT access User A's private work
  const otherWorkRes = await api(`/works/${workA._id}`, {
    headers: { Authorization: `Bearer ${tokenUserB}` },
  });
  assert(otherWorkRes.status === 404, '5.2: User B cannot access User A private work (returns 404)');

  // 5.3: User A can download own original manuscript file
  const ownFileRes = await api(`/works/${workA._id}/file`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(ownFileRes.status === 200, '5.3: Owner can download original manuscript from vault');
  const downloadedBytes = Buffer.from(ownFileRes.data).toString('utf8');
  assert(downloadedBytes === manuscriptContent1, '5.3b: Downloaded manuscript bytes are exact match to original');

  // 5.4: User B CANNOT download User A's original manuscript file
  const otherFileRes = await api(`/works/${workA._id}/file`, {
    headers: { Authorization: `Bearer ${tokenUserB}` },
  });
  assert(otherFileRes.status === 404, '5.4: Non-owner cannot download User A manuscript file (returns 404)');

  // ----------------------------------------------------
  // TEST GROUP 6: DASHBOARD STATS & FILTERS
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: DASHBOARD STATS & FILTERS ---');

  const statsRes = await api('/works/stats', {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(statsRes.status === 200 && statsRes.data.stats.totalWorks >= 1, '6.1: Dashboard stats reflect registered work count');

  const listRes = await api('/works?category=Novel', {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(listRes.status === 200 && listRes.data.works.length >= 1, '6.2: Works list filtered by Category=Novel returns record');

  console.log('\n--- TEST GROUP 7: DOCUMENT VERSION CONTROL ---');

  // 7.1: Register a new revision / Version 2 for Work A
  const v2ManuscriptContent = `Chapter 1: The Cartographer's Revised Awakening.\n\nNow with expanded character dialogue and second draft adjustments.\nRevised at ${Date.now()}`;
  const v2FilePath = path.join(testDir, 'cartographer_draft_v2.txt');
  fs.writeFileSync(v2FilePath, v2ManuscriptContent, 'utf8');

  const v2Form = new FormData();
  v2Form.append(
    'file',
    new Blob([fs.readFileSync(v2FilePath)], { type: 'text/plain' }),
    'cartographer_draft_v2.txt'
  );
  v2Form.append('changeNotes', 'Added expanded dialogue in Chapter 1');

  const v2Res = await api(`/works/${workA._id}/versions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: v2Form,
  });

  if (v2Res.status !== 201) {
    console.error('v2Res error:', v2Res.status, v2Res.data);
  }

  assert(v2Res.status === 201 && v2Res.data.success === true, '7.1: Version 2 registered successfully');
  assert(v2Res.data.newVersion.versionNumber === 2, '7.1b: New version number is 2');
  assert(v2Res.data.work.currentVersion === 2, '7.1c: Current version of work updated to 2');
  assert(v2Res.data.newVersion.sha256Hash !== workA.sha256Hash, '7.1d: Version 2 hash is cryptographically distinct from Version 1');

  // 7.2: Verify Work details returns both versions
  const workADetailsRes = await api(`/works/${workA._id}`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(
    workADetailsRes.status === 200 && workADetailsRes.data.work.versions.length === 2,
    '7.2: Work record maintains immutable version history with 2 versions'
  );

  // 7.3: Download file for specific version (v1 vs v2)
  const v1DownloadRes = await api(`/works/${workA._id}/file?version=1`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  const v2DownloadRes = await api(`/works/${workA._id}/file?version=2`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  const v1Text = Buffer.from(v1DownloadRes.data).toString('utf8');
  const v2Text = Buffer.from(v2DownloadRes.data).toString('utf8');
  assert(v1Text === manuscriptContent1, '7.3a: Downloaded Version 1 matches original draft content');
  assert(v2Text === v2ManuscriptContent, '7.3b: Downloaded Version 2 matches revised draft content');

  // 7.4: Verification matches historical Version 1 vs Version 2
  const v1VerifyForm = new FormData();
  v1VerifyForm.append(
    'file',
    new Blob([fs.readFileSync(manuscriptPath1)], { type: 'text/plain' }),
    'cartographer_chapter1.txt'
  );
  const v1VerifyRes = await api('/verification/check', {
    method: 'POST',
    body: v1VerifyForm,
  });
  assert(
    v1VerifyRes.status === 200 && v1VerifyRes.data.match === true && v1VerifyRes.data.version.versionNumber === 1,
    '7.4a: Verification of original file matches Version 1'
  );

  const v2VerifyForm = new FormData();
  v2VerifyForm.append(
    'file',
    new Blob([fs.readFileSync(v2FilePath)], { type: 'text/plain' }),
    'cartographer_draft_v2.txt'
  );
  const v2VerifyRes = await api('/verification/check', {
    method: 'POST',
    body: v2VerifyForm,
  });
  assert(
    v2VerifyRes.status === 200 && v2VerifyRes.data.match === true && v2VerifyRes.data.version.versionNumber === 2 && v2VerifyRes.data.version.isLatest === true,
    '7.4b: Verification of revised file matches Version 2 (Latest)'
  );

  // 7.5: Certificate generation for specific version
  const certV2Res = await api(`/works/${workA._id}/certificate/download?version=2`);
  assert(certV2Res.status === 200 && certV2Res.headers.get('content-type') === 'application/pdf', '7.5: Certificate for Version 2 generated successfully');

  // ==========================================
  // TEST GROUP 8: AI COPYRIGHT READINESS SCORE & STATUTORY EVALUATION
  // ==========================================
  console.log('\n--- TEST GROUP 8: AI COPYRIGHT READINESS SCORE ---');

  // 8.1: Initial Copyright Readiness score present on work
  const workADetails = await api(`/works/${workA._id}`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  const readiness = workADetails.data.work.copyrightReadiness;
  assert(
    readiness && typeof readiness.score === 'number' && readiness.score >= 0 && readiness.score <= 100,
    '8.1: Work has valid initial AI Copyright Readiness score (0-100)'
  );
  assert(
    ['Ready for Filing', 'Good Preparation', 'Needs Review', 'Incomplete'].includes(readiness.grade),
    '8.1b: Readiness grade is valid statutory category'
  );

  // 8.2: GET /works/:id/readiness returns multi-pillar evaluation
  const readinessRes = await api(`/works/${workA._id}/readiness`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(readinessRes.status === 200, '8.2a: GET /works/:id/readiness returns 200');
  const rData = readinessRes.data.readiness;
  assert(
    rData.breakdown &&
    rData.breakdown.authorshipClaim &&
    rData.breakdown.titleMetadata &&
    rData.breakdown.statutoryNoticeDeposit &&
    rData.breakdown.humanAuthorshipAiDisclosure &&
    rData.breakdown.publicationStatusCompleteness,
    '8.2b: Readiness includes all 5 statutory evaluation pillars'
  );
  assert(Array.isArray(rData.recommendations), '8.2c: Readiness includes actionable recommendations list');
  assert(Array.isArray(rData.checklist), '8.2d: Readiness includes statutory filing checklist');

  // 8.3: POST /works/:id/readiness updates author filing metadata and re-evaluates
  const reEvalRes = await api(`/works/${workA._id}/readiness`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenUserA}` },
    body: {
      yearCompleted: 2026,
      natureOfAuthorship: 'Entire text, original characters and worldbuilding dialogue',
      humanAuthorshipCertified: true,
      publicationStatus: 'unpublished',
      isWorkMadeForHire: false,
      aiContentDisclosed: false,
    },
  });
  assert(reEvalRes.status === 200 && reEvalRes.data.success === true, '8.3a: POST /works/:id/readiness re-evaluates successfully');
  assert(reEvalRes.data.readiness.score >= readiness.score, '8.3b: Re-evaluation with verified metadata maintains or increases score');

  // 8.4: GET /works/:id/readiness/dossier returns formal filing preparation sheet
  const dossierRes = await api(`/works/${workA._id}/readiness/dossier`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(dossierRes.status === 200 && dossierRes.data.dossier, '8.4a: Filing dossier endpoint returns 200 with structured dossier');
  assert(
    dossierRes.data.dossier.formattedStatutoryNotice && dossierRes.data.dossier.pubsealEvidenceTrail,
    '8.4b: Filing dossier contains formatted statutory notice and cryptographic evidence trail'
  );

  // 8.5: Download textual dossier
  const dossierTxtRes = await api(`/works/${workA._id}/readiness/dossier?format=txt`, {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  const dossierTxt = Buffer.from(dossierTxtRes.data).toString('utf8');
  assert(
    dossierTxtRes.status === 200 && dossierTxt.includes('PUBSEAL FORMAL COPYRIGHT REGISTRATION DOSSIER'),
    '8.5: Textual filing dossier downloadable with valid header and structure'
  );

  // 8.6: Non-owner cannot access work readiness (privacy boundary)
  const nonOwnerRes = await api(`/works/${workA._id}/readiness`, {
    headers: { Authorization: `Bearer ${tokenUserB}` },
  });
  assert(nonOwnerRes.status === 404, '8.6: Non-owner cannot access another author copyright readiness evaluation');

  // ==========================================
  // TEST GROUP 9: DATABASE ARCHITECTURE, ACCESS CONTROL & REPOSITORIES
  // ==========================================
  console.log('\n--- TEST GROUP 9: DATABASE ARCHITECTURE & REPOSITORIES ---');

  // 9.0: Unauthorized normal user is blocked with 403
  const blockedUserRes = await api('/database/overview', {
    headers: { Authorization: `Bearer ${tokenUserA}` },
  });
  assert(blockedUserRes.status === 403, '9.0: Regular user blocked from database console with 403 Forbidden');

  // 9.1: Database Overview accessible with Developer/Admin key
  const adminHeaders = {
    Authorization: `Bearer ${tokenUserA}`,
    'x-admin-key': 'pubseal_dev_admin_2026',
  };

  const dbOverviewRes = await api('/database/overview', {
    headers: adminHeaders,
  });
  assert(dbOverviewRes.status === 200, '9.1a: GET /database/overview returns 200 with admin key');
  assert(dbOverviewRes.data.database.engine === 'MongoDB', '9.1b: Database engine is MongoDB');
  assert(
    typeof dbOverviewRes.data.database.metrics.totalDocuments === 'number' &&
    dbOverviewRes.data.database.metrics.totalDocuments > 0,
    '9.1c: Database reports positive total document count'
  );

  // 9.2: Database reports all 5 registered collections
  const collections = dbOverviewRes.data.database.collections;
  const colNames = collections.map((c) => c.name);
  assert(
    colNames.includes('works') &&
    colNames.includes('certificates') &&
    colNames.includes('verifications') &&
    colNames.includes('audits') &&
    colNames.includes('users'),
    '9.2: Database architecture contains all 5 collections (works, certificates, verifications, audits, users)'
  );

  // 9.3: Certificate collection stores official certificate document for registered work
  const certsQueryRes = await api(`/database/collections/certificates?search=${workA.registrationId}`, {
    headers: adminHeaders,
  });
  assert(certsQueryRes.status === 200, '9.3a: GET /database/collections/certificates returns 200');
  assert(certsQueryRes.data.records.length > 0, '9.3b: Certificate record found for registered work');
  assert(
    certsQueryRes.data.records[0].sha256Hash === workA.sha256Hash ||
    certsQueryRes.data.records.some((c) => c.sha256Hash === workA.sha256Hash),
    '9.3c: Stored certificate record matches work SHA-256 hash'
  );

  // 9.4: Verification log collection persists verification attempts
  const verifyLogsRes = await api('/database/collections/verifications?limit=10', {
    headers: adminHeaders,
  });
  assert(verifyLogsRes.status === 200, '9.4a: GET /database/collections/verifications returns 200');
  assert(verifyLogsRes.data.records.length > 0, '9.4b: Verification log records persisted in database');
  assert(
    verifyLogsRes.data.records.some((l) => l.resultStatus === 'EXACT_MATCH'),
    '9.4c: Verification ledger records EXACT_MATCH determination'
  );

  // 9.5: Collection export (JSON and CSV) returns valid file responses
  const exportJsonRes = await api('/database/export/works?format=json', {
    headers: adminHeaders,
  });
  assert(
    exportJsonRes.status === 200 && exportJsonRes.headers.get('content-type').includes('application/json'),
    '9.5a: Export collection as JSON returns 200 with application/json header'
  );

  const exportCsvRes = await api('/database/export/works?format=csv', {
    headers: adminHeaders,
  });
  assert(
    exportCsvRes.status === 200 && exportCsvRes.headers.get('content-type').includes('text/csv'),
    '9.5b: Export collection as CSV returns 200 with text/csv header'
  );

  // 9.6: Full database snapshot export
  const fullBackupRes = await api('/database/export-all', {
    headers: adminHeaders,
  });
  const fullBackup = typeof fullBackupRes.data === 'string' ? JSON.parse(fullBackupRes.data) : fullBackupRes.data;
  assert(fullBackupRes.status === 200, '9.6a: GET /database/export-all returns 200');
  assert(
    fullBackup.database === 'pubseal' &&
    fullBackup.collections &&
    Array.isArray(fullBackup.collections.works) &&
    Array.isArray(fullBackup.collections.certificates),
    '9.6b: Full database backup exports all collections cleanly'
  );

  console.log('\n--- TEST GROUP 10: EMAIL VERIFICATION WORKFLOW ---');
  // 10.1: Newly registered user has isEmailVerified: false
  assert(regRes.data.user.isEmailVerified === false, '10.1a: New user registered with isEmailVerified false');
  assert(regRes.data.devVerificationCode, '10.1b: Registration dispatches 6-digit verification code');

  // 10.2: Invalid 6-digit PIN rejected
  const invalidPinRes = await api('/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserA.email, code: '000000' }),
  });
  assert(invalidPinRes.status === 400 && !invalidPinRes.data.success, '10.2: Invalid 6-digit PIN rejected with 400');

  // 10.3: Valid 6-digit PIN verifies email
  const validPinRes = await api('/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserA.email, code: regRes.data.devVerificationCode }),
  });
  assert(validPinRes.status === 200 && validPinRes.data.success && validPinRes.data.user.isEmailVerified === true, '10.3a: Valid 6-digit PIN verifies user successfully');
  assert(validPinRes.data.user.emailVerifiedAt, '10.3b: emailVerifiedAt timestamp recorded on verification');

  // 10.4: Resend verification code on already verified user returns 400
  const alreadyVerifiedRes = await api('/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserA.email }),
  });
  assert(alreadyVerifiedRes.status === 400, '10.4: Resend on already verified user rejected with 400');

  // 10.5: Register User C and verify via one-click secure token
  const testUserC = {
    name: 'Token Test Author',
    email: `token.test.${Date.now()}@testliterary.org`,
    password: 'Password999!',
  };
  const regUserC = await api('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUserC),
  });
  assert(regUserC.status === 201 && regUserC.data.devVerificationToken, '10.5a: User C registered with token');

  const tokenVerifyRes = await api('/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: regUserC.data.devVerificationToken }),
  });
  assert(tokenVerifyRes.status === 200 && tokenVerifyRes.data.user.isEmailVerified === true, '10.5b: One-click token verifies user');

  // 10.6: Dev email inspector endpoint
  const devEmailInspect = await api('/auth/dev-latest-email');
  assert(devEmailInspect.status === 200 && devEmailInspect.data.success, '10.6: Dev email inspector returns dispatched email logs');

  // Cleanup temporary test artifact files and test database documents
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (e) {}

  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pubseal');
    const db = conn.connection.db;
    await db.collection('users').deleteMany({ email: /testliterary\.org/i });
    await db.collection('works').deleteMany({ authorName: 'Eleanor Vance' });
    await db.collection('certificates').deleteMany({ authorName: 'Eleanor Vance' });
    await db.collection('verificationlogs').deleteMany({
      $or: [
        { matchedTitle: /Cartographer/i },
        { searchedHash: expectedHash1 },
      ],
    });
    await db.collection('auditlogs').deleteMany({ userEmail: /testliterary\.org/i });
    await conn.disconnect();
  } catch (e) {
    console.warn('[Cleanup Warning]:', e.message);
  }

  console.log('\n=====================================================');
  console.log(` ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('=====================================================');
}

runFullE2ETestSuite().catch((err) => {
  console.error('\n[FATAL] Test Suite failed:', err.message);
  process.exit(1);
});

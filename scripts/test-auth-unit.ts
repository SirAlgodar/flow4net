import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';
import assert from 'assert';

async function runAuthTests() {
  console.log('--- Starting Auth Unit Tests ---');

  // 1. Password Hashing
  console.log('Test 1: Password Hashing');
  const password = 'mySecurePassword123';
  const hash = await hashPassword(password);
  assert.notStrictEqual(password, hash, 'Hash should be different from password');
  console.log('✅ Hash generated successfully');

  // 2. Password Comparison
  console.log('Test 2: Password Comparison');
  const isValid = await comparePassword(password, hash);
  assert.strictEqual(isValid, true, 'Password should match hash');
  const isInvalid = await comparePassword('wrongPassword', hash);
  assert.strictEqual(isInvalid, false, 'Wrong password should not match');
  console.log('✅ Password comparison working');

  // 3. JWT Signing
  console.log('Test 3: JWT Signing');
  const payload = { userId: '123', role: 'ADMIN', username: 'admin' };
  const token = signToken(payload);
  assert.ok(token && token.length > 0, 'Token should be generated');
  console.log('✅ Token signed');

  // 4. JWT Verification
  console.log('Test 4: JWT Verification');
  const decoded = verifyToken(token);
  assert.strictEqual(decoded?.userId, payload.userId, 'Decoded userId should match');
  assert.strictEqual(decoded?.role, payload.role, 'Decoded role should match');
  console.log('✅ Token verified');

  // 5. JWT Expiration (Simulated)
  console.log('Test 5: Invalid Token');
  const invalidToken = verifyToken('invalid.token.here');
  assert.strictEqual(invalidToken, null, 'Invalid token should return null');
  console.log('✅ Invalid token handled');

  console.log('--- All Auth Tests Passed ---');
}

runAuthTests().catch(console.error);

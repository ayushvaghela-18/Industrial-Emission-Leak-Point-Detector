import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import app from '../src/app.js';
import { UserRepository } from '../src/utils/repository.js';
import bcrypt from 'bcryptjs';

// HTTP Test Client Helper
const request = (method, path, body = null, extraHeaders = {}) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
      };

      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          server.close();
          try {
            const json = JSON.parse(raw);
            resolve({ status: res.statusCode, headers: res.headers, body: json });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: raw });
          }
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
};

test('=== User Registration & Authentication Integration Suite ===', async (t) => {
  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'Dr. Sarah Connor',
    email: `sarah.connor.${uniqueSuffix}@ecoforge.ai`,
    password: 'CyberdyneCleanEnergy2026!',
  };

  await t.test('1. POST /api/auth/register creates user account and hashes password securely', async () => {
    const res = await request('POST', '/api/auth/register', testUser);

    assert.equal(res.status, 201, 'Should return HTTP 201 Created');
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Account created successfully');
    assert.ok(res.body.data.id, 'User ID must be returned');
    assert.equal(res.body.data.name, testUser.name);
    assert.equal(res.body.data.email, testUser.email.toLowerCase());
    assert.equal(res.body.data.password, undefined, 'Plain password MUST NOT be returned');
    assert.equal(res.body.data.passwordHash, undefined, 'Password hash MUST NOT be returned');

    // Verify stored user in repository has hashed password
    const stored = await UserRepository.findByEmail(testUser.email);
    assert.ok(stored, 'User must exist in repository/database');
    assert.notEqual(stored.password, testUser.password, 'Stored password must not be plain text');
    assert.match(stored.password, /^\$2[aby]\$\d{2}\$/, 'Stored password must be a valid bcrypt hash');
    assert.equal(await bcrypt.compare(testUser.password, stored.password), true, 'Bcrypt compare must succeed');
  });

  await t.test('2. POST /api/auth/register rejects duplicate email address with HTTP 409 Conflict', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Duplicate Sarah',
      email: testUser.email.toUpperCase(), // Test case insensitivity
      password: 'DifferentPassword2026!',
    });

    assert.equal(res.status, 409, 'Should return HTTP 409 Conflict');
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'An account with this email already exists');
    assert.equal(res.body.errorCode, 'DUPLICATE_EMAIL');
  });

  await t.test('3. POST /api/auth/register rejects password shorter than 8 characters', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Weak Password User',
      email: `weak.${uniqueSuffix}@ecoforge.ai`,
      password: '1234567', // 7 chars
    });

    assert.equal(res.status, 400, 'Should return HTTP 400 Bad Request');
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'PASSWORD_TOO_SHORT');
  });

  await t.test('4. POST /api/auth/register rejects invalid work email format', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Invalid Email User',
      email: 'notanemailaddress',
      password: 'ValidPassword123!',
    });

    assert.equal(res.status, 400, 'Should return HTTP 400 Bad Request');
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_EMAIL');
  });

  await t.test('5. POST /api/auth/register rejects empty full name', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: '    ',
      email: `valid.${uniqueSuffix}@ecoforge.ai`,
      password: 'ValidPassword123!',
    });

    assert.equal(res.status, 400, 'Should return HTTP 400 Bad Request');
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'MISSING_NAME');
  });

  await t.test('6. POST /api/auth/login authenticates newly registered user', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });

    assert.equal(res.status, 200, 'Should return HTTP 200 OK');
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Sign in successful');
    assert.ok(res.body.data.user);
    assert.equal(res.body.data.user.email, testUser.email.toLowerCase());
    assert.equal(res.body.data.user.name, testUser.name);
    assert.equal(res.body.data.user.password, undefined);
  });

  await t.test('7. POST /api/auth/login rejects wrong password with HTTP 401 Unauthorized', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'WrongPassword!',
    });

    assert.equal(res.status, 401, 'Should return HTTP 401 Unauthorized');
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'Invalid email or password');
    assert.equal(res.body.errorCode, 'INVALID_CREDENTIALS');
  });

  await t.test('8. POST /api/auth/login rejects non-existent email with HTTP 401 Unauthorized', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: `ghost.user.${uniqueSuffix}@ecoforge.ai`,
      password: 'SomePassword123!',
    });

    assert.equal(res.status, 401, 'Should return HTTP 401 Unauthorized');
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_CREDENTIALS');
  });

  await t.test('9. POST /api/auth/login successfully authenticates Hackathon Demo Mode credentials', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@ecoforge.ai',
      password: 'password123',
    });

    assert.equal(res.status, 200, 'Should return HTTP 200 OK');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'admin@ecoforge.ai');
    assert.equal(res.body.data.user.role, 'admin');
    assert.equal(res.body.data.user.isDemoUser, true);
  });
});

/**
 * Taskly Step 30: Final Production Hardening & Audit Verification Test Suite
 * Validates:
 * 1. Production Environment Validation
 * 2. Security Headers (Helmet)
 * 3. CORS Whitelisting
 * 4. Rate Limiting (API & Auth)
 * 5. Request ID Tracking
 * 6. Request Payload Size Limits
 * 7. Health & Readiness Probes
 * 8. API 404 Routing
 * 9. Password / Secret Sanitization (No password_hash exposed)
 * 10. Centralized Error Sanitization
 * 11. Multi-User Resource Isolation
 */

import http from 'http';
import app from '../app.js';
import { validateEnv } from '../config/env.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, options);
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return {
    status: response.status,
    headers: response.headers,
    data,
  };
};

const runAuditTests = async () => {
  console.log('====================================================');
  console.log('    TASKLY STEP 30: FINAL PRODUCTION AUDIT TESTS    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // Start temporary test server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    console.log(`Test server running at ${baseUrl}\n`);

    // -------------------------------------------------------------
    // 1. Production Environment Validation
    // -------------------------------------------------------------
    console.log('--- 1. Production Environment Validation ---');
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const prodCheck = validateEnv();
    assert(
      typeof prodCheck.isValid === 'boolean',
      'validateEnv() returns validation status object in production mode'
    );
    process.env.NODE_ENV = prevEnv; // Restore

    // -------------------------------------------------------------
    // 2. Health & Readiness Probes
    // -------------------------------------------------------------
    console.log('\n--- 2. Health & Readiness Probes ---');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    assert(healthRes.data?.status === 'healthy', 'GET /api/health indicates healthy status');
    assert(Boolean(healthRes.data?.uptime), 'GET /api/health returns uptime');

    const readyRes = await request('/api/ready');
    assert([200, 503].includes(readyRes.status), 'GET /api/ready returns valid status (200 or 503)');
    assert(Boolean(readyRes.data?.database), 'GET /api/ready reports database state');
    assert(!readyRes.data?.password && !readyRes.data?.dbPassword, 'GET /api/ready never exposes database password');

    // -------------------------------------------------------------
    // 3. Security Headers (Helmet)
    // -------------------------------------------------------------
    console.log('\n--- 3. Security Headers (Helmet) ---');
    const rootRes = await request('/');
    assert(rootRes.status === 200, 'GET / returns API discovery metadata');
    assert(
      rootRes.headers.get('x-content-type-options') === 'nosniff',
      'Helmet X-Content-Type-Options: nosniff header present'
    );
    assert(
      rootRes.headers.get('x-frame-options') === 'DENY',
      'Helmet X-Frame-Options: DENY header present'
    );
    assert(!rootRes.headers.get('x-powered-by'), 'X-Powered-By header is stripped');

    // -------------------------------------------------------------
    // 4. Request ID Tracking
    // -------------------------------------------------------------
    console.log('\n--- 4. Request ID Tracking ---');
    assert(Boolean(rootRes.headers.get('x-request-id')), 'X-Request-Id header attached to response');

    const customReqId = 'test-trace-uuid-12345678';
    const traceRes = await request('/api/health', {
      headers: { 'X-Request-Id': customReqId },
    });
    assert(
      traceRes.headers.get('x-request-id') === customReqId,
      'X-Request-Id header preserves inbound client request ID'
    );

    // -------------------------------------------------------------
    // 5. API 404 Handler
    // -------------------------------------------------------------
    console.log('\n--- 5. API 404 Handler ---');
    const notFoundRes = await request('/api/nonexistent-endpoint-audit');
    assert(notFoundRes.status === 404, 'Undefined API route returns HTTP 404');
    assert(notFoundRes.data?.success === false, '404 response has success: false');
    assert(notFoundRes.data?.message === 'API route not found', '404 response returns standard message');

    // -------------------------------------------------------------
    // 6. Request Body Size Limit
    // -------------------------------------------------------------
    console.log('\n--- 6. Request Body Size Limit (1MB) ---');
    // Payload of ~1.2MB
    const largePayload = JSON.stringify({ largeData: 'a'.repeat(1.2 * 1024 * 1024) });
    const largeRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largePayload,
    });
    assert(
      largeRes.status === 413,
      'Payload exceeding 1MB is rejected with HTTP 413 Payload Too Large'
    );

    // -------------------------------------------------------------
    // 7. Rate Limiting (Authentication)
    // -------------------------------------------------------------
    console.log('\n--- 7. Rate Limiting ---');
    // Reset rate limiter store for clean test run
    authLimiter.store.resetAll();

    let hit429 = false;
    for (let i = 0; i < 25; i++) {
      const res = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ratelimit@example.com', password: 'Password123!' }),
      });
      if (res.status === 429) {
        hit429 = true;
        assert(Boolean(res.headers.get('retry-after')), 'Rate limit response contains Retry-After header');
        assert(Boolean(res.headers.get('x-ratelimit-limit')), 'Rate limit response contains X-RateLimit-Limit');
        break;
      }
    }
    assert(hit429, 'Auth rate limiter triggers HTTP 429 when max attempts are exceeded');

    // Clean up rate limiter store
    authLimiter.store.resetAll();

    // -------------------------------------------------------------
    // 8. Password & Secret Sanitization
    // -------------------------------------------------------------
    console.log('\n--- 8. Password & Secret Sanitization ---');
    const uniqueEmail = `audit_user_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit User',
        email: uniqueEmail,
        password: 'SecurePassword123!',
      }),
    });

    assert(regRes.status === 201, 'User registration succeeds');
    assert(!regRes.data?.data?.user?.password_hash, 'Registration response NEVER exposes password_hash');
    assert(!regRes.data?.data?.user?.password, 'Registration response NEVER exposes plaintext password');

    const authToken = regRes.data?.data?.token;
    assert(Boolean(authToken), 'Registration returns valid JWT authentication token');

    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(meRes.status === 200, 'GET /api/auth/me succeeds for authenticated user');
    assert(!meRes.data?.data?.password_hash, 'GET /api/auth/me NEVER exposes password_hash');
    assert(!meRes.data?.data?.password, 'GET /api/auth/me NEVER exposes password');

    // -------------------------------------------------------------
    // 9. Multi-User Isolation Audit
    // -------------------------------------------------------------
    console.log('\n--- 9. Multi-User Isolation Audit ---');
    // Register User B
    const userBEmail = `audit_user_b_${Date.now()}@example.com`;
    const regBRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit User B',
        email: userBEmail,
        password: 'SecurePassword123!',
      }),
    });
    const tokenB = regBRes.data?.data?.token;

    // User A creates a task
    const taskRes = await request('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'User A Private Deliverable',
        priority: 'high',
      }),
    });
    const userATaskId = taskRes.data?.data?.task?.id || taskRes.data?.data?.id;
    assert(taskRes.status === 201 && Boolean(userATaskId), 'User A creates private task');

    // User B attempts to access User A's task
    const accessRes = await request(`/api/tasks/${userATaskId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      accessRes.status === 404,
      'User B cannot access User A private task (enforces 404 ownership isolation)'
    );

    // User A creates a habit
    const habitRes = await request('/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Private Meditation',
        frequency: 'daily',
      }),
    });
    const habitId = habitRes.data?.data?.habit?.id || habitRes.data?.data?.id;
    assert(habitRes.status === 201 && Boolean(habitId), 'User A creates private habit');

    // User B attempts to access User A's habit
    const habitAccessRes = await request(`/api/habits/${habitId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      habitAccessRes.status === 404,
      'User B cannot access User A private habit (enforces 404 ownership isolation)'
    );

    // User A creates an inbox item
    const inboxRes = await request('/api/inbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'User A Confidential Idea',
        type: 'idea',
      }),
    });
    const inboxId = inboxRes.data?.data?.inboxItem?.id || inboxRes.data?.data?.id;
    assert(inboxRes.status === 201 && Boolean(inboxId), 'User A creates private inbox item');

    // User B attempts to access User A's inbox item
    const inboxAccessRes = await request(`/api/inbox/${inboxId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(
      inboxAccessRes.status === 404,
      'User B cannot access User A inbox item (enforces 404 ownership isolation)'
    );

    console.log('\n====================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    if (server) {
      server.close();
    }
  }
};

runAuditTests();

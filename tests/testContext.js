/**
 * JalDrishti: Test Context & Shared Test Utilities
 *
 * Provides isolated test environment utilities:
 * - MongoDB connection and cleanup helpers
 * - Ephemeral HTTP test server (port 0)
 * - HTTP client with JSON, Buffer, and Multipart support
 * - Assertion runner with pass/fail tracking
 * - Valid JPEG and PNG binary buffer generators
 */

const http = require('http');
const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
const bcrypt = require(path.resolve(__dirname, '../backend/node_modules/bcryptjs'));
const jwt = require(path.resolve(__dirname, '../backend/node_modules/jsonwebtoken'));

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const app = require('../backend/src/app');
const env = require('../backend/src/config/env');
const models = require('../backend/src/models');
const { generateToken } = require('../backend/src/utils/jwt');

// Minimal valid JPEG binary buffer
function createValidJpegBuffer() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);
}

// Minimal valid PNG binary buffer
function createValidPngBuffer() {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
}

class TestContext {
  constructor(suiteName = 'General') {
    this.suiteName = suiteName;
    this.server = null;
    this.passed = 0;
    this.failed = 0;
    this.assertions = [];
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      this.passed++;
      this.assertions.push({ status: 'PASS', message });
    } else {
      console.error(`  [FAIL] ${message}`);
      this.failed++;
      this.assertions.push({ status: 'FAIL', message });
    }
  }

  async setup() {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti';
      await mongoose.connect(mongoUri);
    }
    this.server = http.createServer(app);
    await new Promise((resolve) => this.server.listen(0, '127.0.0.1', resolve));
  }

  async teardown() {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }
  }

  makeRequest(options, requestBody = null) {
    return new Promise((resolve, reject) => {
      const address = this.server.address();
      const reqOptions = {
        hostname: '127.0.0.1',
        port: address.port,
        path: options.path,
        method: options.method || 'GET',
        headers: { ...(options.headers || {}) }
      };

      const effectiveBody = requestBody !== null ? requestBody : (options.body !== undefined ? options.body : null);

      let bodyData = null;
      if (effectiveBody !== null) {
        if (Buffer.isBuffer(effectiveBody)) {
          bodyData = effectiveBody;
          if (!reqOptions.headers['Content-Length']) {
            reqOptions.headers['Content-Length'] = bodyData.length;
          }
        } else if (typeof effectiveBody === 'object') {
          bodyData = JSON.stringify(effectiveBody);
          if (!reqOptions.headers['Content-Type']) {
            reqOptions.headers['Content-Type'] = 'application/json';
          }
          reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
        } else if (typeof effectiveBody === 'string') {
          bodyData = effectiveBody;
          if (!reqOptions.headers['Content-Length']) {
            reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
          }
        }
      }

      const req = http.request(reqOptions, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (_) {
            json = null;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json,
            data: json,
            rawBody: rawData
          });
        });
      });

      req.on('error', reject);

      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  static async disconnectDb() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

module.exports = {
  TestContext,
  models,
  env,
  app,
  bcrypt,
  jwt,
  mongoose,
  generateToken,
  createValidJpegBuffer,
  createValidPngBuffer
};

#!/usr/bin/env node
'use strict';

// Local-only reference signer for FastSpring's secure-payload encryption
// (see methods/secure.html). Reads the RSA private key from disk at runtime —
// never embeds it, never logs it, never returns it. Run this with `node`
// directly; it is NOT meant to be served as a static file.

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 8124;
const ALLOWED_ORIGIN = 'http://localhost:8123';
const KEY_PATH = path.join(os.homedir(), '.fastspring', 'privatekey.pem');

let privateKeyPem;
try {
  privateKeyPem = fs.readFileSync(KEY_PATH, 'utf8');
} catch (err) {
  console.error('Could not read private key at ' + KEY_PATH + ': ' + err.message);
  console.error('Generate one first (see methods/secure.html setup steps).');
  process.exit(1);
}

function signPayload(payloadObj) {
  // 1. Random AES-128 key, encrypts the JSON payload (AES/ECB/PKCS5Padding == PKCS7 for 16-byte blocks).
  const aesKey = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-ecb', aesKey, Buffer.alloc(0));
  const jsonBytes = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const encryptedPayload = Buffer.concat([cipher.update(jsonBytes), cipher.final()]);
  const securePayload = encryptedPayload.toString('base64');

  // 2. RSA-encrypt the AES key itself with our private key (RSA/ECB/PKCS1Padding).
  const encryptedAesKey = crypto.privateEncrypt(
    { key: privateKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
    aesKey
  );
  const secureKey = encryptedAesKey.toString('base64');

  return { securePayload: securePayload, secureKey: secureKey };
}

const server = http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/sign') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found — POST a JSON payload to /sign' }));
    return;
  }

  let body = '';
  req.on('data', function (chunk) { body += chunk; });
  req.on('end', function () {
    try {
      const payload = JSON.parse(body);
      const signed = signPayload(payload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(signed));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('Secure-payload signer listening on http://localhost:' + PORT + '/sign');
  console.log('Reading private key from ' + KEY_PATH);
});

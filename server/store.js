import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/* ------------ tiny JSON-file user store (until the Postgres schema lands) ------------ */

let users = [];
try {
  users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
} catch {
  users = [];
}

export function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email) {
  const needle = String(email || '').trim().toLowerCase();
  return users.find((u) => u.email === needle) || null;
}

export function findUserByToken(token) {
  return users.find((u) => u.verifyToken === token) || null;
}

export function createUser({ fullName, email, mobile, barangay, zone, password }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const user = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    barangay,
    zone,
    passwordHash: `${salt}:${passwordHash}`,
    verifyToken: crypto.randomBytes(32).toString('hex'),
    tokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    verified: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  persist();
  return user;
}

export function verifyUser(user) {
  user.verified = true;
  user.verifiedAt = new Date().toISOString();
  user.verifyToken = null;
  user.tokenExpires = null;
  persist();
}

export function rotateToken(user) {
  user.verifyToken = crypto.randomBytes(32).toString('hex');
  user.tokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  persist();
  return user;
}

export function checkPassword(user, password) {
  const [salt, hash] = user.passwordHash.split(':');
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

export function publicUser(user) {
  const { passwordHash, verifyToken, tokenExpires, ...rest } = user;
  return rest;
}

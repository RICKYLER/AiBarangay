/* Load environment before anything else reads process.env.
 *
 * The repo keeps a single root .env (never committed). When the API is
 * started from backend/ (npm --prefix, node --watch), dotenv's default
 * cwd lookup misses it — so resolve it relative to this file, then let
 * a backend/.env or cwd .env override if present. */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../../.env') }); // repo root
dotenv.config({ path: path.resolve(here, '../../.env') });    // backend/.env
dotenv.config();                                              // cwd (dev override)

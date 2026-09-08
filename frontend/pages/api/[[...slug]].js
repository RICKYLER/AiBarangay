import app from '../../server/app.js';

/**
 * Express-in-Next bridge — every /api/* request (any method, any path)
 * is handed to the Express app in frontend/server/app.js.
 *
 * bodyParser must stay OFF: Express parses JSON itself, and the report
 * photo upload needs the raw multipart stream for multer.
 *
 * In production (Vercel) this runs as the serverless function behind
 * /api — same origin as the site, so the httpOnly session cookie is
 * always same-site. Locally, `next dev` serves it identically: there is
 * no separate API process anymore.
 */

export const config = {
  api: { bodyParser: false },
  // The report submission includes a 25s-timeout LLM call; hobby-plan
  // ceiling is 60s. (Also set in vercel.json for good measure.)
  maxDuration: 60,
};

export default function handler(req, res) {
  return app(req, res);
}

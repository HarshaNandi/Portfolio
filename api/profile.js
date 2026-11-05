// Vercel serverless function: GET /api/profile
const profile = require('../server/data/profile.json');

module.exports = (_req, res) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(profile);
};

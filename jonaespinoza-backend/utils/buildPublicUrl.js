// utils/buildPublicUrl.js
function buildPublicUrl(filename, baseUrl = "") {
  // si exponés /uploads como estático, con relativo alcanza
  if (!baseUrl) return `/uploads/${filename}`;
  return `${baseUrl.replace(/\/$/, "")}/uploads/${filename}`;
}
module.exports = { buildPublicUrl };

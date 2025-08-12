// middlewares/parseMetadata.js
// Explicación: si viene multipart con `metadata` (string JSON),
// lo parseamos y lo volcamos sobre req.body. No pisamos otros campos.

module.exports = function parseMetadata(req, res, next) {
  try {
    const allowed = [
      "title",
      "subtitle",
      "descriptionMd",
      "alt",
      "location",
      "takenDate",
      "tags",
      "featured",
      "isVisible",
      "order",
    ];

    // 1) Si vino metadata como string JSON, la parseamos
    const raw = req.body?.metadata;
    if (typeof raw === "string" && raw.trim() !== "") {
      const meta = JSON.parse(raw);
      for (const k of allowed) {
        if (
          Object.prototype.hasOwnProperty.call(meta, k) &&
          req.body[k] === undefined
        ) {
          req.body[k] = meta[k];
        }
      }
    }

    // 2) Normalizo tags si llegó como string "a, b, c"
    if (typeof req.body.tags === "string") {
      req.body.tags = req.body.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // 3) Normalizo booleanos si llegaron como strings
    if (typeof req.body.featured === "string")
      req.body.featured = ["true", "1", "on"].includes(
        req.body.featured.toLowerCase()
      );
    if (typeof req.body.isVisible === "string")
      req.body.isVisible = ["true", "1", "on"].includes(
        req.body.isVisible.toLowerCase()
      );

    return next();
  } catch (e) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "metadata inválido (JSON)",
    });
  }
};

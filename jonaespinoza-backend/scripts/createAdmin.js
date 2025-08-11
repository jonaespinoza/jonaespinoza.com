// scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("../models/User");

// Conecta, crea admin si no existe, y sale
(async () => {
  try {
    const uri =
      process.env.MONGO_URI || "mongodb://localhost:27017/jonaespinoza";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("[Mongo] Conectado");

    const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn("[Seed] Faltan variables ADMIN_*; no se crea admin.");
      process.exit(0);
    }

    const exists = await User.findOne({
      $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
    });
    if (exists) {
      console.log("[Seed] Admin ya existe:", exists.username);
      process.exit(0);
    }

    const passwordHash = await argon2.hash(ADMIN_PASSWORD);
    await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });

    console.log("[Seed] Admin creado:", ADMIN_USERNAME);
    process.exit(0);
  } catch (e) {
    console.error("[Seed] Error:", e);
    process.exit(1);
  }
})();

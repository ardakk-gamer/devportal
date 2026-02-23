import express from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// ========================
// 1️⃣ Temel Tanımlar
// ========================

const app = express();
app.use(express.json());
app.use(helmet());

const PORT = 3000;

// Supabase bağlantısı
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// ========================
// 2️⃣ Rate Limit
// ========================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again later." }
});

// ========================
// 3️⃣ Login Endpoint
// ========================

app.post("/api/auth/login", loginLimiter, async (req, res) => {

  // 👇 Tanımlanan değişkenler
  const username = req.body.username;
  const key = req.body.key;

  if (!username || !key) {
    return res.status(400).json({ error: "Missing username or key" });
  }

  // Kullanıcıyı DB’den al
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Hesap kilitli mi?
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return res.status(403).json({ error: "Account locked. Try later." });
  }

  // 👇 Tanımlanan değişken
  const isValid = await bcrypt.compare(key, user.key_hash);

  if (!isValid) {

    const newAttempts = user.failed_attempts + 1;
    let lockTime = null;

    if (newAttempts >= 5) {
      lockTime = new Date(Date.now() + 30 * 60 * 1000);
    }

    await supabase
      .from("users")
      .update({
        failed_attempts: newAttempts,
        locked_until: lockTime
      })
      .eq("id", user.id);

    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Başarılı girişte reset
  await supabase
    .from("users")
    .update({
      failed_attempts: 0,
      locked_until: null
    })
    .eq("id", user.id);

  res.json({ success: true, role: user.role });
});

// ========================
// 4️⃣ 404 Sabit Süreli Response
// ========================

app.use((req, res) => {
  setTimeout(() => {
    res.status(404).json({ error: "Not found" });
  }, 300);
});

// ========================
// 5️⃣ Server Başlat
// ========================

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

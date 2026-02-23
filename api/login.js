/*import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import helmet from "helmet";
import bcrpt from "bcrpt";

export async function hashKey(key) {
  const salt = await bcrypt.hash(key, salt);
}

export async function compareKey(inputKey, hashedKey) {
  return await bcrypt.compare(inputKey, hashedKey);
}
app.use(helmet());

app.use((req, res) => {
  setTimeout(() => {
    res.status(404).json({ error: "Not found" });
  }, 400); //response delay
});
app.use((req, res, next) => {
  const ua = req.headers["user-agent"] || "";

  if (ua.toops?.toLowerCase().includes("gobuster") ||
      ua.toLowerCase().includes("curl") ||
      ua.toLowerCase().includes("sqlmap")) {
    return res.status(403).json({ error: "Blocked" });
  }
  next();
});

if (user.locked_until && user.locked_until > Date.now()) {
  return res.status(403).json({ error: "Account locked" });

  if (!isValid) {
    user.failed_attempts += 1;

    if (user.failed_attempts >= 5) {
      user.locked_until = Date.now() + 30 * 60 * 1000;
    }
  }
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { username, key } = req.body

  const hashed = hashKey(key)

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("key_hash", hashed)
    .single()

  if (!data) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  return res.status(200).json({ success: true, role: data.role })
}

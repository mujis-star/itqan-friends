const admin = require("firebase-admin");

require("dotenv").config({ path: ".env.local" });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = admin.firestore();

async function check() {
  console.log("=== Magazines ===");
  const m = await db.collection("magazines").orderBy("createdAt", "desc").limit(5).get();
  m.forEach(d => console.log(d.id, d.data()));

  console.log("\n=== Gallery ===");
  const g = await db.collection("gallery").orderBy("createdAt", "desc").limit(5).get();
  g.forEach(d => console.log(d.id, d.data()));
}

check().catch(console.error);

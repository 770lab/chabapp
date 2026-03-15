const functions = require("firebase-functions");
const https = require("https");

const ALLOWED_ORIGINS = [
  "https://770lab.com",
  "https://770lab.github.io",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

/**
 * GET /ytFeed?channels=ID1,ID2,...
 * Proxy pour les flux RSS YouTube (contourne CORS)
 */
exports.ytFeed = functions.https.onRequest((req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "GET") return res.status(405).send("GET only");

  const channels = (req.query.channels || "").split(",").filter(Boolean);
  if (!channels.length) return res.status(400).json({ error: "No channels" });

  const fetches = channels.map((chId) => {
    return new Promise((resolve) => {
      const url = "https://www.youtube.com/feeds/videos.xml?channel_id=" + chId;
      https.get(url, (resp) => {
        let data = "";
        resp.on("data", (c) => { data += c; });
        resp.on("end", () => { resolve({ channelId: chId, xml: data }); });
      }).on("error", () => { resolve({ channelId: chId, xml: "" }); });
    });
  });

  Promise.all(fetches).then((results) => {
    res.set("Cache-Control", "public, max-age=900");
    res.json(results);
  });
});

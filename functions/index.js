const functions = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const Busboy = require("busboy");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk").default;
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const ALLOWED_ORIGINS = [
  "https://770lab.com",
  "https://770lab.github.io",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * POST /voiceForm
 * Multipart: audio file + fields JSON
 * Returns: { transcript, analysis, actions, values }
 */
exports.voiceForm = functions
  .runWith({ secrets: [OPENAI_API_KEY, ANTHROPIC_API_KEY], memory: "512MB", timeoutSeconds: 120 })
  .https.onRequest((req, res) => {
    setCors(req, res);

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const busboy = Busboy({ headers: req.headers });
    let audioBuffer = null;
    let audioFilename = "audio.webm";
    let fieldsJson = "[]";

    busboy.on("file", (fieldname, file, info) => {
      if (fieldname === "audio") {
        const chunks = [];
        audioFilename = info.filename || "audio.webm";
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => {
          audioBuffer = Buffer.concat(chunks);
        });
      }
    });

    busboy.on("field", (fieldname, val) => {
      if (fieldname === "fields") {
        fieldsJson = val;
      }
    });

    busboy.on("finish", async () => {
      try {
        if (!audioBuffer || audioBuffer.length === 0) {
          return res.status(400).json({ error: "No audio file received" });
        }

        // 1. Transcribe with Whisper
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

        const audioFile = new File([audioBuffer], audioFilename, {
          type: "audio/webm",
        });

        const whisperRes = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: audioFile,
          language: "fr",
        });

        const transcript = whisperRes.text;

        if (!transcript || transcript.trim().length === 0) {
          return res.json({
            transcript: "",
            analysis: "Aucune parole detectee",
            actions: [],
            values: {},
          });
        }

        // 2. Parse form fields
        let formFields;
        try {
          formFields = JSON.parse(fieldsJson);
        } catch {
          formFields = [];
        }

        // 3. Analyze with Claude
        const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

        const fieldsList = formFields
          .map((f) => `- ${f.id} (${f.type}): ${f.label || f.placeholder || f.name || f.id}`)
          .join("\n");

        const claudeRes = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `Tu es un assistant qui extrait des informations d'une note vocale pour remplir un formulaire.

Voici les champs du formulaire :
${fieldsList}

Voici la transcription de la note vocale :
"${transcript}"

Analyse la transcription et extrait les valeurs pour chaque champ du formulaire.
Reponds UNIQUEMENT en JSON valide avec cette structure :
{
  "analysis": "Resume court de ce qui a ete dit",
  "values": {
    "field_id": "valeur extraite",
    ...
  },
  "actions": ["description de chaque action identifiee"]
}

Regles :
- Ne remplis que les champs dont tu es sur de la valeur
- Pour les champs numeriques, ne mets que des chiffres
- Pour les select/radio, utilise la valeur exacte de l'option
- Pour les checkboxes, utilise true/false
- Si un champ n'est pas mentionne, ne l'inclus pas dans values`,
            },
          ],
        });

        let parsed;
        try {
          const text = claudeRes.content[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch {
          parsed = {
            analysis: claudeRes.content[0].text,
            values: {},
            actions: [],
          };
        }

        return res.json({
          transcript,
          analysis: parsed.analysis || "",
          values: parsed.values || {},
          actions: parsed.actions || [],
        });
      } catch (err) {
        console.error("voiceForm error:", err);
        return res.status(500).json({ error: err.message || "Internal error" });
      }
    });

    busboy.end(req.rawBody);
  });


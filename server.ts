import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up large JSON body limit to receive base64 audio files smoothly
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini SDK client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in your environment or Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route: Analyze Interview Audio
app.post("/api/analyze-audio", async (req, res) => {
  try {
    const { audio, mimeType, name } = req.body;

    if (!audio || !mimeType) {
      return res.status(400).json({
        error: "Missing required parameters: 'audio' (base64 string) and 'mimeType' are required.",
      });
    }

    const ai = getAiClient();

    const audioPart = {
      inlineData: {
        mimeType,
        data: audio,
      },
    };

    const prompt = `Analyze this interview call audio. Transcribe and diarize it between the 'Interviewer' and the 'Candidate' (the interviewee).
Evaluate engagement levels (0 to 100) and sentiments chronologically.
Identify exactly 3 strengths and exactly 3 constructive missed opportunities for the Candidate.
Provide an overall interview performance score out of 100, and a concise 2-3 sentence coaching summary.
Ensure all timestamps are in the format MM:SS (e.g. 00:04, 00:32, 01:10, etc.).`;

    const systemInstruction = `You are an elite Interview Coach and Speech Analyst.
Analyze the provided interview audio file and generate structured analysis.
Diarize speakers correctly, mapping them to 'Interviewer' or 'Candidate'.
Generate exactly 3 candidate strengths and exactly 3 missed opportunities.
Map 8 to 15 sentiment data points representing the engagement level (0-100) and sentiment over the timeline for both speakers.
Provide timestamps in MM:SS format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        audioPart,
        { text: prompt }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerName: {
              type: Type.STRING,
              description: "Estimated or identified name/label of the interviewer."
            },
            candidateName: {
              type: Type.STRING,
              description: "Estimated or identified name/label of the candidate."
            },
            overallScore: {
              type: Type.INTEGER,
              description: "Overall interview performance rating for the candidate out of 100."
            },
            summary: {
              type: Type.STRING,
              description: "A professional, empathetic, and strategic 2-3 sentence coaching summary."
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 distinct highlights or things the interviewee did exceptionally well."
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 clear, constructive, and actionable missed opportunities or suggestions."
            },
            sentimentPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: {
                    type: Type.STRING,
                    description: "Chronological time marker in MM:SS format."
                  },
                  engagement: {
                    type: Type.INTEGER,
                    description: "Numeric score from 0 to 100 reflecting vocal energy, interest, or response speed."
                  },
                  sentiment: {
                    type: Type.STRING,
                    description: "Single-word mood label, e.g. 'Confident', 'Hesitant', 'Enthusiastic', 'Anxious', 'Inquisitive'."
                  },
                  speaker: {
                    type: Type.STRING,
                    description: "Must be 'Interviewer' or 'Candidate'."
                  }
                },
                required: ["timestamp", "engagement", "sentiment", "speaker"]
              },
              description: "8 to 15 sequence intervals mapped across the duration of the interview."
            },
            transcript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: {
                    type: Type.STRING,
                    description: "Time marker in MM:SS format."
                  },
                  speaker: {
                    type: Type.STRING,
                    description: "Must be 'Interviewer' or 'Candidate'."
                  },
                  text: {
                    type: Type.STRING,
                    description: "The verbatim text spoken in this dialogue turn."
                  }
                },
                required: ["timestamp", "speaker", "text"]
              },
              description: "Diarized dialogue segments sorted chronologically."
            }
          },
          required: [
            "interviewerName",
            "candidateName",
            "overallScore",
            "summary",
            "strengths",
            "improvements",
            "sentimentPoints",
            "transcript"
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini API");
    }

    const jsonResult = JSON.parse(resultText);
    res.json(jsonResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while analyzing the audio file.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Interview Coach Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import ViteExpress from "vite-express";
import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/dialogflow", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required in request body" });
    }

    try {
        const sessionId = uuidv4();
        // const sessionClient = new SessionsClient();
        const sessionClient = new SessionsClient({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
        const sessionPath = sessionClient.projectAgentSessionPath(
            process.env.DIALOGFLOW_PROJECT_ID,
            sessionId
        );

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text,
                    languageCode: "en-US",
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        res.json({ reply: result.fulfillmentText });
    } catch (err) {
        console.error("Error calling Dialogflow:", err);
        res.status(500).json({ error: "Internal error", details: err.message });
    }
});

ViteExpress.listen(app, 5173, () => console.log("Server is listening..."));

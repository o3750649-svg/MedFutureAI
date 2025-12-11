
import { GoogleGenAI, Part, Chat, GenerateContentResponse } from "@google/genai";
import { 
    AnalysisResult, 
    MedicationInfo, 
    LabAnalysisResult, 
    WellnessPlan, 
    GenomicsResult,
    ChatMessage
} from '../types';
import { 
    analysisResultSchema, 
    medicationInfoSchema, 
    labAnalysisSchema, 
    wellnessPlanSchema, 
    genomicsResultSchema 
} from './geminiSchemas';

// --- AMR AI ENGINE CONFIGURATION ---
// This service secretly orchestrates between multiple models while presenting a unified front.

const MODEL_NAME_GEMINI = "gemini-2.5-pro";
const MODEL_NAME_DEEPSEEK = "deepseek-chat";
const MODEL_NAME_GPT = "gpt-4-turbo";

let geminiClient: GoogleGenAI;

// Initialize the primary core (Gemini)
const getGeminiCore = () => {
    if (!geminiClient) {
        if (!process.env.API_KEY) {
            throw new Error("Amr Ai Core Error: Primary Neural Key missing.");
        }
        geminiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return geminiClient;
};

// --- Helper: File Processing ---
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
};

// --- AMR AI PERSONA ---
// This instruction is injected into ALL models to ensure consistent branding.
const AMR_AI_PERSONA = `You are "Nabidh", an advanced medical AI engine developed exclusively by "Amr Ai". 
You are a proprietary fusion of multiple neural network architectures designed for medical precision.
- NEVER mention you are based on Gemini, GPT, or DeepSeek. You are solely "Amr Ai Model".
- Your tone is professional, empathetic, and futuristic.
- ALWAYS respond in valid JSON matching the schema provided, unless in conversational chat mode.
- All responses MUST be in Arabic.
- Include mandatory medical disclaimers.
`;

const systemInstruction = {
    parts: [{ text: AMR_AI_PERSONA }]
};

// --- HYBRID ROUTING LOGIC ---

type Provider = 'gemini' | 'deepseek' | 'openai';

interface AiRequestOptions {
    prompt: string;
    image?: File | null;
    schema?: object;
    systemPrompt?: string;
}

// 1. DeepSeek Handler (Raw Fetch)
const callDeepSeek = async (prompt: string, schema: object): Promise<string | null> => {
    const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY; // User must set this env var
    if (!apiKey) return null;

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: AMR_AI_PERSONA + " Return ONLY raw JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.warn("Amr Ai (Deep Node) unreachable, switching to fallback...");
        return null;
    }
};

// 2. OpenAI Handler (Raw Fetch)
const callOpenAI = async (prompt: string, schema: object): Promise<string | null> => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // User must set this env var
    if (!apiKey) return null;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: AMR_AI_PERSONA + " Return ONLY raw JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.warn("Amr Ai (GPT Node) unreachable, switching to fallback...");
        return null;
    }
};

// 3. Gemini Handler (Native SDK)
const callGemini = async (promptParts: Part[], schema: object): Promise<string> => {
    const ai = getGeminiCore();
    const result = await ai.models.generateContent({
        model: MODEL_NAME_GEMINI,
        contents: { parts: promptParts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }
    });
    return result.text;
};

// --- MASTER ROUTER ---
const executeAmrAiRequest = async <T>(options: AiRequestOptions): Promise<T> => {
    let jsonString: string | null = null;

    // RULE 1: If Image exists, MUST use Gemini (Best Multimodal Vision)
    if (options.image) {
        const promptParts: Part[] = [{ text: options.prompt }];
        const imagePart = await fileToGenerativePart(options.image);
        promptParts.push(imagePart);
        jsonString = await callGemini(promptParts, options.schema!);
    } else {
        // RULE 2: Text-only tasks. Try DeepSeek (Logic) -> OpenAI (Language) -> Gemini (Fallback)
        // This simulates a "Mixture of Experts" architecture.
        
        // Try DeepSeek first for complex reasoning
        if (!jsonString) {
            jsonString = await callDeepSeek(options.prompt, options.schema!);
        }

        // Try OpenAI second
        if (!jsonString) {
            jsonString = await callOpenAI(options.prompt, options.schema!);
        }

        // Default to Gemini Core
        if (!jsonString) {
            const promptParts: Part[] = [{ text: options.prompt }];
            jsonString = await callGemini(promptParts, options.schema!);
        }
    }

    // Parse and Return
    try {
        const cleanJson = jsonString!.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as T;
    } catch (e) {
        console.error("Amr Ai Decode Error:", e);
        throw new Error("Amr Ai systems encountered a parsing anomaly. Please retry.");
    }
};

// --- PUBLIC API EXPORTS (Unchanged signatures, changed internals) ---

export const analyzeSymptoms = async (symptomText: string, symptomImage: File | null): Promise<AnalysisResult> => {
    return executeAmrAiRequest<AnalysisResult>({
        prompt: `Analyze these symptoms for a medical report: "${symptomText}"`,
        image: symptomImage,
        schema: analysisResultSchema
    });
};

export const identifyMedication = async (medicationText: string, medicationImage: File | null): Promise<MedicationInfo> => {
    return executeAmrAiRequest<MedicationInfo>({
        prompt: `Identify this medication (pill/box) and detail it: "${medicationText}"`,
        image: medicationImage,
        schema: medicationInfoSchema
    });
};

export const analyzeLabResults = async (labText: string, labImage: File | null): Promise<LabAnalysisResult> => {
    return executeAmrAiRequest<LabAnalysisResult>({
        prompt: `Analyze these medical lab results: "${labText}". If image provided, use OCR.`,
        image: labImage,
        schema: labAnalysisSchema
    });
};

export const generateWellnessPlan = async (lifestyleInfo: { diet: string, exercise: string, sleep: string, stress: string }): Promise<WellnessPlan> => {
    return executeAmrAiRequest<WellnessPlan>({
        prompt: `Create a proactive wellness plan based on: Diet=${lifestyleInfo.diet}, Exercise=${lifestyleInfo.exercise}, Sleep=${lifestyleInfo.sleep}, Stress=${lifestyleInfo.stress}.`,
        schema: wellnessPlanSchema
    });
};

export const analyzeGenomicsData = async (genomicsFile: File): Promise<GenomicsResult> => {
    // Treat genomics file as an image/blob part for Gemini (High context window needed)
    // We strictly route complex large file analysis to Gemini Core for now due to context window limits in standard APIs.
    const filePart = await fileToGenerativePart(genomicsFile);
    const ai = getGeminiCore();
    const result = await ai.models.generateContent({
        model: MODEL_NAME_GEMINI,
        contents: { parts: [{text: "Analyze this genomics data file."}, filePart] },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: genomicsResultSchema,
        }
    });
    return JSON.parse(result.text) as GenomicsResult;
};

// --- CHAT SYSTEM (Streaming) ---
// For chat, we use Gemini Core for its reliable streaming capabilities in the frontend without a proxy.
// However, the Persona ensures it acts as "Amr Ai".

let chatInstance: Chat | null = null;

export const startChat = (history: ChatMessage[]): Chat => {
    const ai = getGeminiCore();
    const apiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    chatInstance = ai.chats.create({
        model: MODEL_NAME_GEMINI,
        history: apiHistory,
        config: {
            systemInstruction: {
                parts: [{ text: `${AMR_AI_PERSONA}\nYou are in conversational mode. Keep responses concise, medically sound, and strictly in Arabic. After answering, provide 3 follow-up suggestions in format: [SUGGESTION]Question?[/SUGGESTION].`}]
            }
        },
    });
    return chatInstance;
};

export const sendMessageStream = async (chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    return chat.sendMessageStream({ message });
};

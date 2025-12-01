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

const MODEL_NAME = "gemini-2.5-pro";
let ai: GoogleGenAI;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

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

const systemInstruction = {
    parts: [{
        text: `You are "Nabidh", a super-intelligent, empathetic AI medical assistant from the future. Your name means "brilliant physician" in ancient Arabic. Your purpose is to provide comprehensive, clear, and actionable health insights in Arabic.
- ALWAYS respond in valid JSON that conforms to the provided schema, unless in chat mode.
- Your analysis must be thorough, evidence-based, and presented in a calm, reassuring, and professional tone.
- You must always include the mandatory disclaimers about consulting a human doctor.
- Your language should be clear and accessible to a non-medical audience.
- All text content within the JSON response or chat response MUST be in Arabic.
- Where relevant and safe, you may also suggest a separate plan for traditional herbal remedies in the 'herbalRemediesPlan' section. This should always be presented as complementary and not a replacement for conventional medicine, with a strong disclaimer about potential interactions and the need to consult a specialist.`
    }]
};

const generateJson = async <T>(promptParts: Part[], schema: object): Promise<T> => {
    const ai = getAI();
    const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: promptParts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
        }
    });

    const text = result.text.trim();
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("The model returned an invalid response. Please try again.");
    }
};

export const analyzeSymptoms = async (symptomText: string, symptomImage: File | null): Promise<AnalysisResult> => {
    const promptParts: Part[] = [
        { text: `Analyze the following symptoms to provide a comprehensive medical report. User input: "${symptomText}"` }
    ];

    if (symptomImage) {
        const imagePart = await fileToGenerativePart(symptomImage);
        promptParts.push(imagePart);
        promptParts.push({ text: "The user has also provided an image related to their symptoms. Factor this into your analysis."});
    }

    return generateJson<AnalysisResult>(promptParts, analysisResultSchema);
};

export const identifyMedication = async (medicationText: string, medicationImage: File | null): Promise<MedicationInfo> => {
    const promptParts: Part[] = [
        { text: `Identify the following medication and provide detailed information about it. User input: "${medicationText}"` }
    ];

    if (medicationImage) {
        const imagePart = await fileToGenerativePart(medicationImage);
        promptParts.push(imagePart);
        promptParts.push({ text: "The user has provided an image of the medication (pill or packaging). Use this as the primary source for identification if available."});
    }
    
    return generateJson<MedicationInfo>(promptParts, medicationInfoSchema);
};

export const analyzeLabResults = async (labText: string, labImage: File | null): Promise<LabAnalysisResult> => {
    const promptParts: Part[] = [
        { text: `Analyze the following medical lab results and provide a detailed breakdown and interpretation. User input: "${labText}"` }
    ];
    if (labImage) {
        const imagePart = await fileToGenerativePart(labImage);
        promptParts.push(imagePart);
        promptParts.push({ text: "The user has provided an image of the lab report. Use OCR to extract the data and perform the analysis."});
    }
    return generateJson<LabAnalysisResult>(promptParts, labAnalysisSchema);
};

export const generateWellnessPlan = async (lifestyleInfo: { diet: string, exercise: string, sleep: string, stress: string }): Promise<WellnessPlan> => {
    const prompt = `Based on the user's lifestyle information, create a personalized, proactive wellness and prevention plan.
    - Diet: ${lifestyleInfo.diet}
    - Exercise: ${lifestyleInfo.exercise}
    - Sleep Quality: ${lifestyleInfo.sleep}
    - Stress Level: ${lifestyleInfo.stress}
    
    The plan should be encouraging, realistic, and focus on actionable steps.`;

    return generateJson<WellnessPlan>([ { text: prompt }], wellnessPlanSchema);
};

export const analyzeGenomicsData = async (genomicsFile: File): Promise<GenomicsResult> => {
    const filePart = await fileToGenerativePart(genomicsFile);
    const promptParts = [
        { text: `Analyze the provided genomics data file. Extract key findings, assess health risks, and provide pharmacogenomic insights. The user has uploaded a file, which may be in formats like VCF, TXT, or a PDF report. Interpret it to the best of your ability.`},
        filePart
    ];

    return generateJson<GenomicsResult>(promptParts, genomicsResultSchema);
};

let chatInstance: Chat | null = null;

export const startChat = (history: ChatMessage[]): Chat => {
    const ai = getAI();
    // Reformat history for the API
    const apiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    chatInstance = ai.chats.create({
        model: 'gemini-2.5-pro',
        history: apiHistory,
        config: {
            systemInstruction: {
                parts: [{ text: `${systemInstruction.parts[0].text}\nYou are now in a conversational chat mode. The user may ask follow-up questions about previous analyses or ask new questions. Maintain your persona as "Nabidh". Keep responses concise and conversational, but still medically sound. Use basic markdown for formatting (bolding, lists). After your main response, provide up to three relevant, concise follow-up questions that the user might have. Enclose each question in special tags like this: [SUGGESTION]What are the side effects?[/SUGGESTION]. Do not add any text before or after these tags. All text responses MUST be in Arabic.`}]
            }
        },
    });
    return chatInstance;
};

export const sendMessageStream = async (chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    return chat.sendMessageStream({ message });
};
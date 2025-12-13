
import { Type } from "@google/genai";

export const analysisResultSchema = {
  type: Type.OBJECT,
  properties: {
    primaryDiagnosis: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The most likely diagnosis." },
        details: { type: Type.STRING, description: "A detailed explanation of the primary diagnosis, its causes, and typical progression." },
      },
      required: ["title", "details"],
    },
    differentialDiagnosis: {
      type: Type.ARRAY,
      description: "A list of other possible diagnoses, ranked by likelihood.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The name of the alternative diagnosis." },
          likelihood: { type: Type.STRING, description: "The likelihood of this diagnosis (e.g., 'High', 'Medium', 'Low')." },
          rationale: { type: Type.STRING, description: "The reasoning for considering this diagnosis based on the symptoms." },
        },
        required: ["title", "likelihood", "rationale"],
      },
    },
    medicationPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title for the medication plan section." },
        disclaimer: { type: Type.STRING, description: "A mandatory safety disclaimer about consulting a doctor before taking medication." },
        medications: {
          type: Type.ARRAY,
          description: "A list of suggested medications.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The name of the medication." },
              dosage: { type: Type.STRING, description: "The recommended dosage (e.g., '500mg')." },
              frequency: { type: Type.STRING, description: "How often to take the medication (e.g., 'Twice a day')." },
              notes: { type: Type.STRING, description: "Additional important notes about the medication." },
            },
            required: ["name", "dosage", "frequency", "notes"],
          },
        },
      },
      required: ["title", "disclaimer", "medications"],
    },
    herbalRemediesPlan: {
      type: Type.OBJECT,
      description: "An optional plan for complementary herbal or natural remedies.",
      properties: {
        title: { type: Type.STRING },
        disclaimer: { type: Type.STRING, description: "Mandatory safety disclaimer about consulting a professional before using herbs." },
        remedies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              usage: { type: Type.STRING, description: "How to prepare and use the remedy." },
              notes: { type: Type.STRING, description: "The purported benefits or mechanism of action." },
            },
            required: ["name", "usage", "notes"],
          }
        }
      },
      required: ["title", "disclaimer", "remedies"],
    },
    treatmentPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title for the treatment plan section." },
        steps: {
          type: Type.ARRAY,
          description: "A list of recommended non-medication treatment steps.",
          items: { type: Type.STRING },
        },
      },
      required: ["title", "steps"],
    },
    prevention: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Title for the prevention section." },
        recommendations: {
          type: Type.ARRAY,
          description: "A list of recommendations to prevent recurrence or worsening of the condition.",
          items: { type: Type.STRING },
        },
      },
      required: ["title", "recommendations"],
    },
  },
  required: ["primaryDiagnosis", "differentialDiagnosis", "medicationPlan", "treatmentPlan", "prevention"],
};

export const medicationInfoSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The commercial or brand name of the medication." },
        activeIngredient: { type: Type.STRING, description: "The main active chemical component of the medication." },
        usage: { type: Type.STRING, description: "A detailed description of what the medication is primarily used for." },
        dosageInfo: { type: Type.STRING, description: "General information about how the medication is typically dosed." },
        sideEffects: {
            type: Type.ARRAY,
            description: "A list of common side effects.",
            items: { type: Type.STRING }
        },
        warnings: {
            type: Type.ARRAY,
            description: "A list of important warnings, contraindications, or interactions.",
            items: { type: Type.STRING }
        }
    },
    required: ["name", "activeIngredient", "usage", "dosageInfo", "sideEffects", "warnings"]
};

export const labAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        overview: { type: Type.STRING, description: "A high-level summary of the lab results." }
      },
      required: ["title", "overview"]
    },
    keyIndicators: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        indicators: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the lab indicator (e.g., 'Hemoglobin')." },
              value: { type: Type.STRING, description: "The measured value with units (e.g., '14.5 g/dL')." },
              normalRange: { type: Type.STRING, description: "The normal reference range with units (e.g., '13.5-17.5 g/dL')." },
              isAbnormal: { type: Type.BOOLEAN, description: "True if the value is outside the normal range." },
              interpretation: { type: Type.STRING, description: "An explanation of what this value means, especially if abnormal." },
              valueAsNumber: { type: Type.NUMBER, description: "The numeric part of the value." },
              rangeMin: { type: Type.NUMBER, description: "The minimum value of the normal range." },
              rangeMax: { type: Type.NUMBER, description: "The maximum value of the normal range." },
            },
            required: ["name", "value", "normalRange", "isAbnormal", "interpretation", "valueAsNumber", "rangeMin", "rangeMax"]
          }
        }
      },
      required: ["title", "indicators"]
    },
    conclusion: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        details: { type: Type.STRING, description: "A concluding paragraph synthesizing the findings." }
      },
      required: ["title", "details"]
    },
    disclaimer: { type: Type.STRING, description: "A mandatory disclaimer." }
  },
  required: ["summary", "keyIndicators", "conclusion", "disclaimer"]
};

export const wellnessPlanSchema = {
  type: Type.OBJECT,
  properties: {
    overallGoal: { type: Type.STRING, description: "A summary of the main health goal this plan aims to achieve." },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "recommendations"]
    },
    exercise: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "recommendations"]
    },
    mentalWellness: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "recommendations"]
    },
    disclaimer: { type: Type.STRING, description: "A mandatory disclaimer about consulting a healthcare professional." }
  },
  required: ["overallGoal", "nutrition", "exercise", "mentalWellness", "disclaimer"]
};

export const genomicsResultSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        overview: { type: Type.STRING, description: "A high-level summary of the genomics report." }
      },
      required: ["title", "overview"]
    },
    keyFindings: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        findings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              gene: { type: Type.STRING },
              variant: { type: Type.STRING },
              implication: { type: Type.STRING, description: "What this genetic variant implies for health." },
              recommendation: { type: Type.STRING, description: "Actionable advice based on the finding." }
            },
            required: ["gene", "variant", "implication", "recommendation"]
          }
        }
      },
      required: ["title", "findings"]
    },
    riskAnalysis: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING, description: "The health condition." },
              riskLevel: { type: Type.STRING, description: "e.g., 'Elevated', 'Average', 'Reduced'" },
              explanation: { type: Type.STRING, description: "Why the risk level is as stated." }
            },
            required: ["condition", "riskLevel", "explanation"]
          }
        }
      },
      required: ["title", "risks"]
    },
    pharmacogenomics: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        insights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              drugCategory: { type: Type.STRING },
              gene: { type: Type.STRING },
              impact: { type: Type.STRING, description: "How genetics might impact response to this drug category." }
            },
            required: ["drugCategory", "gene", "impact"]
          }
        }
      },
      required: ["title", "insights"]
    },
    disclaimer: { type: Type.STRING, description: "A mandatory disclaimer about the nature of genomic insights." }
  },
  required: ["summary", "keyFindings", "riskAnalysis", "pharmacogenomics", "disclaimer"]
};
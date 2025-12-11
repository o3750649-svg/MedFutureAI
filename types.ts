
// This file defines the core data structures and types used throughout the application.
import type { AppMode } from './App';

// Represents the comprehensive analysis result for a user's symptoms.
export interface AnalysisResult {
  primaryDiagnosis: {
    title: string;
    details: string;
  };
  differentialDiagnosis: {
    title: string;
    likelihood: string;
    rationale: string;
  }[];
  medicationPlan: {
    title: string;
    disclaimer: string;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      notes: string;
    }[];
  };
  herbalRemediesPlan?: {
    title: string;
    disclaimer: string;
    remedies: {
      name: string;
      usage: string;
      notes: string;
    }[];
  };
  treatmentPlan: {
    title: string;
    steps: string[];
  };
  prevention: {
    title: string;
    recommendations: string[];
  };
}

// Represents detailed information about a specific medication.
export interface MedicationInfo {
  name: string;
  activeIngredient: string;
  usage: string;
  dosageInfo: string;
  sideEffects: string[];
  warnings: string[];
}

// Represents the analysis of a user's lab test results.
export interface LabAnalysisResult {
  summary: {
    title: string;
    overview: string;
  };
  keyIndicators: {
    title: string;
    indicators: {
      name: string;
      value: string;
      normalRange: string;
      isAbnormal: boolean;
      interpretation: string;
      valueAsNumber: number;
      rangeMin: number;
      rangeMax: number;
    }[];
  };
  conclusion: {
    title: string;
    details: string;
  };
  disclaimer: string;
}

// Represents a single message in a chat conversation.
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  suggestions?: string[];
}

// Represents a personalized wellness and prevention plan.
export interface WellnessPlan {
  overallGoal: string;
  nutrition: {
    title:string;
    recommendations: string[];
  };
  exercise: {
    title: string;
    recommendations: string[];
  };
  mentalWellness: {
    title: string;
    recommendations: string[];
  };
  disclaimer: string;
}

// Represents the analysis of a user's genomics data.
export interface GenomicsResult {
  summary: {
    title: string;
    overview: string;
  },
  keyFindings: {
    title: string;
    findings: {
      gene: string;
      variant: string;
      implication: string;
      recommendation: string;
    }[]
  },
  riskAnalysis: {
    title: string;
    risks: {
      condition: string;
      riskLevel: string;
      explanation: string;
    }[]
  },
  pharmacogenomics: {
    title: string;
    insights: {
      drugCategory: string;
      gene: string;
      impact: string;
    }[]
  },
  disclaimer: string;
}

// Represents the data for the user's digital twin.
export interface DigitalTwinData {
    personal: {
        name?: string;
        age: number;
        weight: number; // in kg
        height: number; // in cm
        gender: 'male' | 'female';
    };
    vitals: {
        heartRate: number;
        bloodPressure: string;
        temperature: number;
        respiratoryRate: number;
        bloodOxygen: number; // SpO2
    },
    activity: {
        steps: number;
        activeMinutes: number;
        sleepHours: number;
    },
    riskFactors: {
        name: string;
        level: 'منخفض' | 'متوسط' | 'مرتفع';
    }[],
    lastAnalysis: {
        title: string;
        mode: AppMode;
    } | null;
}

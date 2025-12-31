
export type RiskLevelType = 'Green' | 'Yellow' | 'Red';
export type PersonalityType = '過度補償型' | '焦慮敏感型' | '自我放逐型' | '掌控攻擊型' | '待觀察';

export interface PersonalDetails {
  name: string;
  gender: string;
  age: string;
  contact: string;
  roomNumber: string;
  assessor: string; // 新增評估人
}

export interface ReportParts {
  crisisAdvice: string;
  riskStrategy: string;
  benefitAnalysis: string;
}

export interface QuestionConfig {
  id: number;
  part: string;
  text: string;
  weights: {
    none: [number, number, number, number];
    low: [number, number, number, number];
    medium: [number, number, number, number];
    high: [number, number, number, number];
  };
  options: {
    none: string;
    low: string;
    medium: string;
    high: string;
  };
  descriptions: {
    none: string;
    low: string;
    medium: string;
    high: string;
  };
}

export interface CrisisQuestionConfig {
  id: number;
  text: string;
  category: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  calculationBasis: 'per_time' | 'per_month';
  recommendedFor: number[];
  defaultQuantity: number;
}

export interface AssessmentData {
  personalDetails: PersonalDetails;
  personBrief: string;
  answers: Record<number, 'none' | 'low' | 'medium' | 'high' | null>;
  crisisAnswers: Record<number, boolean>;
  crisisStatus: RiskLevelType;
  personalityType: PersonalityType;
  qualitativeAnalysis: string;
  
  dimensions: {
    physical: number;
    family: number;
    mental: number;
    management: number;
  };
  totalScore: number;
  riskLevel: RiskLevelType;
}

export interface SelectedService extends ServiceItem {
  dailyFreq: number;
  monthlyDays: number;
}

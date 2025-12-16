
export type RiskLevelType = 'Green' | 'Yellow' | 'Red';

export interface PersonalDetails {
  name: string;
  gender: string;
  age: string;
  contact: string;
}

export interface QuestionConfig {
  id: number;
  text: string;
  weights: {
    low: [number, number, number, number];
    medium: [number, number, number, number];
    high: [number, number, number, number];
  };
  options: {
    low: string;
    medium: string;
    high: string;
  };
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // '小時', '次', '天', '月', '式', '夜'
  calculationBasis: 'per_time' | 'per_month'; // How to calculate 30-day total
  recommendedFor: number[]; // Dimension indices (0-3) relevant to this service
  defaultQuantity: number;
}

export interface AssessmentData {
  personalDetails: PersonalDetails;
  personBrief: string; // 新增：人物簡述與事件描述
  answers: Record<number, 'low' | 'medium' | 'high' | null>; // Question ID -> Answer
  qualitativeAnalysis: string;
  
  // Calculated values
  dimensions: {
    physical: number; // 面向一
    family: number;   // 面向二
    mental: number;   // 面向三
    management: number; // 面向四
  };
  totalScore: number;
  riskLevel: RiskLevelType;
}

export interface SelectedService extends ServiceItem {
  dailyFreq: number;    // Times/Hours per day (or Quantity for monthly packages)
  monthlyDays: number;  // Days per month the service is used
}

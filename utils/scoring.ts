import { QUESTIONS } from '../constants';
import { AssessmentData, RiskLevelType } from '../types';

export const calculateScores = (answers: AssessmentData['answers'], ageString: string): {
  dimensions: AssessmentData['dimensions'];
  totalScore: number;
  riskLevel: RiskLevelType;
} => {
  const dims = [0, 0, 0, 0]; // 0: Physical, 1: Family, 2: Mental, 3: Management

  // 1. Calculate Base Scores from Answers
  Object.entries(answers).forEach(([qIdStr, level]) => {
    if (!level) return;
    const qId = parseInt(qIdStr);
    const question = QUESTIONS.find(q => q.id === qId);
    if (question && question.weights[level]) {
      const weights = question.weights[level];
      dims[0] += weights[0];
      dims[1] += weights[1];
      dims[2] += weights[2];
      dims[3] += weights[3];
    }
  });

  // 2. Calculate Age Bonus
  // Rule: If Age > 65, add 1 point to EACH dimension for every 5 full years over 65.
  const age = parseInt(ageString);
  let ageBonus = 0;
  if (!isNaN(age) && age > 65) {
    ageBonus = Math.floor((age - 65) / 5);
  }

  // Apply bonus to all dimensions
  dims[0] += ageBonus;
  dims[1] += ageBonus;
  dims[2] += ageBonus;
  dims[3] += ageBonus;

  const totalScore = dims.reduce((a, b) => a + b, 0);
  
  // Calculate max dimension score to determine overall risk
  const maxDimScore = Math.max(...dims);

  let riskLevel: RiskLevelType = 'Green';
  
  // Logic: 0-10 Green, 11-25 Yellow, 26+ Red
  if (maxDimScore >= 26) {
    riskLevel = 'Red';
  } else if (maxDimScore >= 11) {
    riskLevel = 'Yellow';
  } else {
    riskLevel = 'Green';
  }

  return {
    dimensions: {
      physical: dims[0],
      family: dims[1],
      mental: dims[2],
      management: dims[3],
    },
    totalScore,
    riskLevel,
  };
};

export const getRiskColorClass = (level: RiskLevelType) => {
  switch(level) {
    case 'Red': return 'bg-red-500 text-white';
    case 'Yellow': return 'bg-yellow-400 text-slate-900';
    case 'Green': return 'bg-green-500 text-white';
    default: return 'bg-slate-200';
  }
};

export const getDimensionRiskLevel = (score: number): RiskLevelType => {
  if (score >= 26) return 'Red';
  if (score >= 11) return 'Yellow';
  return 'Green';
};

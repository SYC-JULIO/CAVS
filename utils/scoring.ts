
import { QUESTIONS } from '../constants';
import { AssessmentData, RiskLevelType, PersonalityType } from '../types';

export const calculateScores = (answers: AssessmentData['answers'], ageString: string): {
  dimensions: AssessmentData['dimensions'];
  totalScore: number;
  riskLevel: RiskLevelType;
} => {
  const dims = [0, 0, 0, 0]; 

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

  const age = parseInt(ageString);
  let ageBonus = 0;
  if (!isNaN(age) && age > 65) {
    ageBonus = Math.floor((age - 65) / 5);
  }

  dims[0] += ageBonus;
  dims[1] += ageBonus;
  dims[2] += ageBonus;
  dims[3] += ageBonus;

  const totalScore = dims.reduce((a, b) => a + b, 0);
  const maxDimScore = Math.max(...dims);

  let riskLevel: RiskLevelType = 'Green';
  if (maxDimScore >= 26) riskLevel = 'Red';
  else if (maxDimScore >= 11) riskLevel = 'Yellow';
  else riskLevel = 'Green';

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

export const calculateCrisisStatus = (crisisAnswers: Record<number, boolean>): RiskLevelType => {
  const yesCount = Object.values(crisisAnswers).filter(v => v === true).length;
  
  if (crisisAnswers[10]) return 'Red';
  if (crisisAnswers[9] && (crisisAnswers[1] || crisisAnswers[2])) return 'Red';
  if (yesCount > 6) return 'Red';

  if (crisisAnswers[9]) return 'Yellow';
  if (crisisAnswers[8]) return 'Yellow';
  if (yesCount >= 3 && yesCount <= 5) return 'Yellow';

  return 'Green';
};

export const determinePersonalityType = (data: Partial<AssessmentData>): PersonalityType => {
  const dims = data.dimensions;
  const crisis = data.crisisAnswers || {};
  
  if (!dims) return '待觀察';

  if (dims.management > dims.physical && (crisis[4] || crisis[10])) {
    return '掌控攻擊型';
  }
  
  if (dims.mental > dims.physical && (crisis[4] || crisis[6])) {
    return '焦慮敏感型';
  }

  if (dims.mental > 15 && (crisis[3] || crisis[5] || crisis[8])) {
    return '自我放逐型';
  }

  if (dims.physical > 15 && crisis[2]) {
    return '過度補償型';
  }

  const maxDim = Math.max(dims.physical, dims.family, dims.mental, dims.management);
  if (maxDim === dims.management) return '掌控攻擊型';
  if (maxDim === dims.mental) return '焦慮敏感型';
  if (dims.physical > 20) return '過度補償型';
  
  return '待觀察';
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

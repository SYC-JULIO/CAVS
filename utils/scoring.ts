
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
  const answers = data.answers || {};
  
  // 基礎保底類型，防止極端空資料情況
  const defaultFallback: PersonalityType = '過度補償型';
  if (!dims) return defaultFallback;

  // 定義各型態對應的關鍵題目 ID (風險評估 30 題)
  const keys = {
    dominating: [4, 22, 14, 10, 19, 30],
    anxious: [2, 3, 4, 5, 8, 9, 20, 11, 13, 27, 25, 29, 30],
    withdrawn: [1, 3, 8, 6, 24, 11, 13, 15, 23, 17],
    compensating: [4, 8, 22, 9, 12, 27, 16, 19, 30]
  };

  // 計算每個型態勾選中/高的題目數量
  const getWeight = (ids: number[]) => {
    return ids.reduce((count, id) => {
      const val = answers[id];
      return (val === 'medium' || val === 'high') ? count + 1 : count;
    }, 0);
  };

  const weights = {
    dominating: getWeight(keys.dominating),
    anxious: getWeight(keys.anxious),
    withdrawn: getWeight(keys.withdrawn),
    compensating: getWeight(keys.compensating)
  };

  // 1. 優先考慮心理危機的極端表現
  if (crisis[10] || crisis[9] || crisis[4]) {
    if (weights.dominating > 2) return '掌控攻擊型';
    if (weights.anxious > 3) return '焦慮敏感型';
  }

  // 2. 綜合判斷 (維度分數 + 關鍵題權重)
  if (dims.management > 15 && weights.dominating >= 2) return '掌控攻擊型';
  if (dims.mental > 15 && weights.anxious >= 3) return '焦慮敏感型';
  if (weights.withdrawn >= 4 || (dims.mental > 15 && weights.withdrawn >= 2)) return '自我放逐型';
  if (dims.physical > 15 && weights.compensating >= 3) return '過度補償型';

  // 3. 最終判定：選取獲得配分（關鍵題權重）最高的類別
  const weightEntries = [
    { type: '掌控攻擊型' as PersonalityType, weight: weights.dominating },
    { type: '焦慮敏感型' as PersonalityType, weight: weights.anxious },
    { type: '自我放逐型' as PersonalityType, weight: weights.withdrawn },
    { type: '過度補償型' as PersonalityType, weight: weights.compensating }
  ];

  // 排序：權重由高到低
  weightEntries.sort((a, b) => b.weight - a.weight);
  
  // 返回權重最高者，不再返回「待觀察」
  return weightEntries[0].type;
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
}

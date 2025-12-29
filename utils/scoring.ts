
import { QUESTIONS } from '../constants';
import { AssessmentData, RiskLevelType } from '../types';

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
  
  // 🔴 紅燈條件
  // 1. Q10 (計畫) 為「是」 ➔ 直接紅燈
  if (crisisAnswers[10]) return 'Red';
  // 2. Q9 (主動意念) 為「是」 且 Q1 (剛出院) 或 Q2 (強勢受挫) 為「是」
  if (crisisAnswers[9] && (crisisAnswers[1] || crisisAnswers[2])) return 'Red';
  // 3. 總題數回答「是」超過 6 題
  if (yesCount > 6) return 'Red';

  // 🟡 黃燈條件
  // 1. Q9 (主動意念) 為「是」 但無具體計畫
  if (crisisAnswers[9]) return 'Yellow';
  // 2. Q8 (被動意念) 為「是」
  if (crisisAnswers[8]) return 'Yellow';
  // 3. Q1 至 Q7 中，回答「是」達 3~5 題
  if (yesCount >= 3 && yesCount <= 5) return 'Yellow';

  // 🟢 綠燈條件 (Q9, Q10必須為否且Yes數 0-2)
  return 'Green';
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

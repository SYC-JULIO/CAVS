
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依序嘗試的模型清單。
 * 優先選用 Gemini 3 系列提供更高品質的推理。
 */
const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3-pro-preview'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 按照規範，直接使用 process.env.API_KEY，不進行前置攔截，讓 SDK 在呼叫時決定
  const highRiskAnswers = Object.entries(data.answers)
    .filter(([_, level]) => level === 'high')
    .map(([id]) => {
      const q = QUESTIONS.find(q => q.id === parseInt(id));
      return q ? `${q.id}. ${q.text} (選擇：${q.options.high})` : '';
    })
    .filter(s => s !== '')
    .join('\n');

  const detectedCrisis = Object.entries(data.crisisAnswers)
    .filter(([_, val]) => val === true)
    .map(([id]) => {
      const q = CRISIS_QUESTIONS.find(q => q.id === parseInt(id));
      return q ? `[${q.category}] ${q.text}` : '';
    })
    .filter(s => s !== '')
    .join('\n');

  const dims = [
    data.dimensions.physical,
    data.dimensions.family,
    data.dimensions.mental,
    data.dimensions.management
  ];
  
  const dimInfo = dims.map((score, index) => {
     const risk = getDimensionRiskLevel(score);
     return `${DIMENSION_NAMES[index]}: ${score}分 (${risk === 'Red' ? '紅燈' : risk === 'Yellow' ? '黃燈' : '綠燈'})`;
  }).join('\n    * ');

  const highestDimIndex = dims.indexOf(Math.max(...dims));
  const highestDimName = DIMENSION_NAMES[highestDimIndex];
  
  const prompt = `
**【角色與任務設定】**
您是「共居住宅」的資深生活管家總管。請根據以下住戶數據生成專業分析報告。
語氣：專業理性但溫暖（像家人的關心）。
開頭請務必使用「您好。」

**【個案資料】**
* 姓名：${data.personalDetails.name} | 房間：${data.personalDetails.roomNumber || '未安排'}
* 心理危機燈號：${data.crisisStatus} (檢出：${detectedCrisis || '無'})
* 四大面向風險得分：
    * ${dimInfo}
* 背景與簡述：${data.personBrief || '無提供'}
* 其他質性描述：${data.qualitativeAnalysis || '無'}

---
【報告結構與要求】
1. **心理危機處置建議**：針對檢出的心理危機，給予生活管家最直接的應對與環境安全指引。
2. **風險管理策略**：結合最高風險面向「${highestDimName}」，標註**粗體安全警示**項目。
3. **服務預期產生效益**：請嚴格遵守以下格式規範。
   * 格式：◆[潛在問題]：藉由[管家介入手段]，期待[改善效益]。
   * ⚠️ 禁語：嚴格禁止出現「護理」、「照護」、「醫療」、「護士」等醫療領域詞彙。請改用「生活協助」、「管家介入」、「生理支持」等。
  `;

  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      // 根據規範，在每次呼叫前建立新的實例以獲取最新 Key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      
      if (response && response.text) {
        return response.text;
      }
    } catch (error: any) {
      console.warn(`[Gemini SDK] 模型 ${modelName} 呼叫失敗:`, error.message);
      lastError = error;
      
      // 判斷是否為授權問題 (401, 403, 或訊息中包含 API key)
      const errorStr = error.toString().toLowerCase();
      if (
        errorStr.includes("api key") || 
        errorStr.includes("401") || 
        errorStr.includes("403") ||
        errorStr.includes("unauthorized") ||
        errorStr.includes("not found")
      ) {
        throw new Error("AUTH_REQUIRED");
      }
      
      // 如果是配額問題，繼續嘗試下一個模型
      if (errorStr.includes("429") || errorStr.includes("quota")) {
        continue;
      }
    }
  }
  
  // 如果遍歷完都失敗
  if (lastError?.message?.includes("429") || lastError?.message?.includes("quota")) {
    throw new Error("今日免費分析額度已用完，請稍後再試。");
  }

  throw new Error("AI 引擎初始化失敗，請確認您的網路連線或 API 金鑰狀態。");
};

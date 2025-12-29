
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照使用者要求設定模型循環序列
 * 1. gemini-2.5-flash
 * 2. gemini-2.5-flash-lite
 * 3. gemini-2.5-flash-preview-tts
 * 4. gemini-3-flash
 * 5. gemini-robotics-er-1.5-preview
 * 6. gemma-3-12b
 */
const MODELS_FALLBACK = [
  'gemini-2.5-flash-latest',
  'gemini-2.5-flash-lite-latest',
  'gemini-2.5-flash-preview-tts',
  'gemini-3-flash-preview',
  'gemini-robotics-er-1.5-preview',
  'gemma-3-12b'
];
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
console.log("Debug Key:", apiKey); //
export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("AUTH_REQUIRED");
  }

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

  const highestDimName = DIMENSION_NAMES[dims.indexOf(Math.max(...dims))];
  
  const prompt = `
**【角色與任務設定】**
您是「共居住宅」的資深生活管家總管。請根據以下住戶數據生成專業分析報告。
語氣：專業理性但溫暖。開頭請務必使用「您好。」

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
3. **服務預期產生效益**：
   * 格式：◆[潛在問題]：藉由[管家介入手段]，期待[改善效益]。
   * ⚠️ 禁語：嚴格禁止出現「照護」、「醫療」等醫療詞彙。請改用「生活協助」、「管家介入」等。
  `;

  // 嘗試循環模型邏輯
  for (let i = 0; i < MODELS_FALLBACK.length; i++) {
    const currentModel = MODELS_FALLBACK[i];
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
      });
      
      if (response && response.text) {
        return response.text;
      }
    } catch (error: any) {
      console.warn(`[Model Fallback Attempt ${i+1}/${MODELS_FALLBACK.length}] ${currentModel} failed:`, error.message);
      
      const errorStr = error.toString().toLowerCase();
      
      // 若是金鑰無效 (401/403)，通常切換模型也沒用，直接拋出
      if (errorStr.includes("api key") || errorStr.includes("401") || errorStr.includes("unauthorized")) {
        throw new Error("AUTH_REQUIRED");
      }

      // 如果不是最後一個模型，則嘗試下一個
      if (i < MODELS_FALLBACK.length - 1) {
        continue; 
      }
    }
  }

  // 若循環結束仍無結果
  throw new Error("今日免費額度已用完，請聯繫工作人員");
};

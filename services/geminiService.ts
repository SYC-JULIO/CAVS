
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照使用者要求設定模型循環序列
 */
const MODELS_FALLBACK = [
  'gemini-2.5-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-preview-tts',
  'gemini-3-flash-preview',
  'gemini-robotics-er-1.5-preview',
  'gemma-3-12b'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 在 Vite/Render 環境下，嘗試讀取多種可能的變數名稱以增加容錯率
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("偵測不到 API 金鑰 (API_KEY is missing)。請確保已在 Render 設定環境變數。");
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

  let lastErrorMsg = "";

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
      const status = error.status || "Unknown";
      const message = error.message || "No message provided";
      console.warn(`[Fallback] ${currentModel} failed (Status: ${status}): ${message}`);

      // 建立詳細的偵錯訊息
      if (message.includes("401") || message.includes("403") || message.includes("API key not valid")) {
          lastErrorMsg = `[401/403] API 金鑰無效或權限不足。請檢查您的 Render 設定中 KEY 名稱是否正確（建議使用 VITE_API_KEY）。`;
          // 授權失敗通常切換模型也沒用，但我們還是按要求走完循環或拋出
          throw new Error(lastErrorMsg);
      } else if (message.includes("429") || message.includes("Quota")) {
          lastErrorMsg = `[429] 模型 ${currentModel} 的免費額度已用完。`;
      } else if (message.includes("404") || message.includes("not found")) {
          lastErrorMsg = `[404] 模型名稱 '${currentModel}' 無法識別或尚未在您的區域開放。`;
      } else {
          lastErrorMsg = `[${status}] ${message}`;
      }

      // 如果不是最後一個模型，繼續嘗試
      if (i === MODELS_FALLBACK.length - 1) {
        throw new Error("今日免費額度已用完，請聯繫工作人員");
      }
    }
  }

  throw new Error("今日免費額度已用完，請聯繫工作人員");
};

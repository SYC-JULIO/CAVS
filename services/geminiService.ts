
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照使用者要求，固定使用 gemini-2.5-flash-lite-latest
 */
const TARGET_MODEL = 'gemini-2.5-flash-lite-latest';

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 建立分析所需的上下文資訊
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
   * ⚠️ 禁語：嚴格禁止出現「護理」、「照護」、「醫療」、「護士」等醫療領域詞彙。請改用「生活協助」、「管家介入」、「生理支持」等。
  `;

  try {
    // 嚴格遵守規範：每次呼叫前建立新的實例，並使用 process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: TARGET_MODEL,
      contents: prompt,
    });
    
    if (response && response.text) {
      return response.text;
    } else {
      throw new Error("模型回傳內容異常，請稍後再試。");
    }
  } catch (error: any) {
    console.error(`[Gemini SDK Error]`, error);
    
    const errorStr = error.toString().toLowerCase();
    
    // 識別是否為 API Key 相關問題
    if (
      errorStr.includes("api key") || 
      errorStr.includes("401") || 
      errorStr.includes("403") ||
      errorStr.includes("unauthorized") ||
      errorStr.includes("not found")
    ) {
      throw new Error("AUTH_REQUIRED");
    }
    
    // 識別配額問題
    if (errorStr.includes("429") || errorStr.includes("quota")) {
      throw new Error("免費額度已達上限或請求過於頻繁，請稍候。");
    }

    throw new Error(error.message || "分析過程中發生未知異常。");
  }
};

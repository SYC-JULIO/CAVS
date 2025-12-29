
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照 Google GenAI SDK 規範設定模型 fallback
 */
const MODELS_TO_TRY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = process.env.API_KEY;

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
* 性格行為型態：${data.personalityType}
* 四大面向風險得分：
    * ${dimInfo}
* 背景與簡述：${data.personBrief || '無提供'}
* 其他質性描述：${data.qualitativeAnalysis || '無'}

---
【報告結構與要求】
1. **心理危機處置建議**：
   針對檢出的心理危機與「${data.personalityType}」特徵，給予生活管家最直接的應對與環境安全指引。
   請在內容中強調「心理介入」手段。

2. **風險管理策略**：
   結合最高風險面向「${highestDimName}」，標註**粗體安全警示**項目。
   針對其「${data.personalityType}」之特性（如：掌控感、焦慮、退縮或補償），提供具體的管理心法。

3. **服務預期產生效益**：
   * ⚠️ 嚴格執行：請使用「條列式 (Bullet Points)」呈現，嚴禁使用任何形式的 Markdown 表格。
   * 格式要求：
     * ◆ [潛在問題]：藉由 [管家介入手段]，期待 [改善效益]。
   * ⚠️ 禁語：嚴格禁止出現「照護」、「醫療」、「患者」、「病人」等醫療化詞彙。請改用「生活協助」、「管家介入」、「個案」、「長輩」等。

⚠️ 格式標記要求（重要）：
為了讓系統自動套用顏色，請確保以下標題正確出現：
- 「## 心理危機處置建議」
- 「## 風險管理策略」
- 「## 服務預期產生效益」
  `;

  let lastErrorMsg = "";

  for (let i = 0; i < MODELS_TO_TRY.length; i++) {
    const currentModel = MODELS_TO_TRY[i];
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
      const message = error.message || "No message provided";
      console.warn(`[Fallback] ${currentModel} failed: ${message}`);

      if (message.includes("401") || message.includes("403") || message.includes("API key not valid")) {
          lastErrorMsg = `[401/403] API 金鑰無效或權限不足。`;
          throw new Error(lastErrorMsg);
      } else if (message.includes("429") || message.includes("Quota")) {
          lastErrorMsg = `[429] 模型 ${currentModel} 的免費額度已用完。`;
      } else {
          lastErrorMsg = `Error: ${message}`;
      }

      if (i === MODELS_TO_TRY.length - 1) {
        throw new Error(lastErrorMsg || "今日免費額度已用完，請聯繫工作人員");
      }
    }
  }

  throw new Error("今日免費額度已用完，請聯繫工作人員");
};

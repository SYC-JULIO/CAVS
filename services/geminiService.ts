
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照使用者要求設定模型嘗試順序（Fallback Sequence）
 * 當前一模型額度用盡或出錯時，依序嘗試
 */
const MODELS_TO_TRY = [
  'gemini-2.5-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-preview-tts',
  'gemini-3-flash-preview',
  'gemini-robotics-er-1.5-preview',
  'gemma-3-12b'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 直接使用環境變數中的 API_KEY
  if (!process.env.API_KEY) {
    throw new Error("偵測不到 API 金鑰 (API_KEY is missing)。請確保系統環境變數配置正確。");
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
  
  const systemInstruction = `您是「共居住宅」的資深生活管家總管。請根據以下住戶數據生成專業分析報告。
語氣：專業理性但溫暖。開頭請務必使用「您好。」`;

  const prompt = `
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

  let lastError: any = null;

  // 遍歷所有指定的模型進行嘗試
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`正在嘗試使用模型: ${modelName}`);
      
      // 規範要求：每次發起請求前都要新建 GoogleGenAI 實例
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 只有 Gemini 3 和 2.5 系列支援 thinkingConfig
      const supportsThinking = modelName.includes('gemini-3') || modelName.includes('gemini-2.5');
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          ...(supportsThinking ? { thinkingConfig: { thinkingBudget: 2000 } } : {})
        },
      });
      
      if (response && response.text) {
        console.log(`模型 ${modelName} 成功生成報告。`);
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`模型 ${modelName} 呼叫失敗，嘗試下一個。錯誤訊息: ${error.message}`);
      
      // 如果是因為 API Key 無效等不可恢復的錯誤，可能需要考慮是否繼續。
      // 但根據使用者需求，我們依序嘗試完整個列表。
    }
  }

  // 如果所有模型都失敗了
  throw new Error(`所有模型 (${MODELS_TO_TRY.join(', ')}) 嘗試均失敗。最後一個錯誤: ${lastError?.message || "未知錯誤"}`);
};

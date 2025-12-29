
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照指引規定之型號進行嘗試 (Fallback Sequence)
 * 1. gemini-3-pro-preview (高階推理，支援思考功能)
 * 2. gemini-3-flash-preview (平衡效能)
 * 3. gemini-flash-lite-latest (輕量快速，極低延遲)
 * 4. gemini-flash-latest (穩定版本保底)
 */
const MODELS_TO_TRY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 1. 取得並檢查 API 金鑰 (由系統環境注入)
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    throw new Error("系統偵測不到 API 金鑰。請確認環境變數 'API_KEY' 配置正確。");
  }

  // 2. 格式化評估數據
  const detectedCrisis = Object.entries(data.crisisAnswers || {})
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

  // 3. 執行備援迴圈
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[Gemini SDK] 正在嘗試呼叫模型: ${modelName}`);
      
      // 規範：每次發起請求前初始化實例
      const ai = new GoogleGenAI({ apiKey });
      
      // 判斷是否支援思考功能 (3 系列與 2.5 系列)
      const supportsThinking = modelName.includes('gemini-3') || modelName.includes('gemini-2.5');
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          ...(supportsThinking ? { thinkingConfig: { thinkingBudget: 2000 } } : {})
        },
      });

      // 成功獲取結果 (使用 .text 屬性而非方法)
      if (response && response.text) {
        console.log(`[Gemini SDK] 模型 ${modelName} 成功生成報告。`);
        return response.text;
      }
      
      throw new Error("模型回應內容為空");
    } catch (err: any) {
      lastError = err;
      const errorMsg = err.message || "";
      console.warn(`[Gemini SDK] 模型 ${modelName} 失敗: ${errorMsg}`);
      
      // 關鍵錯誤攔截：如果是 403 或金鑰無效，不需要重試其他模型
      if (errorMsg.includes('403') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('permission')) {
        throw new Error("API 金鑰權限不足或無效。請確認您的 Google AI Studio 金鑰是否處於可用狀態且已綁定付費專案。");
      }
      
      // 429 或其他網路錯誤則繼續下一個模型
    }
  }

  // 4. 全部失敗時的回報
  throw new Error(`所有模型嘗試皆失敗。最後一項錯誤訊息：${lastError?.message || "網路連線異常，請稍後再試"}`);
};

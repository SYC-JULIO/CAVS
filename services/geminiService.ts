
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照任務類型設定模型嘗試順序 (Fallback Strategy)
 * 1. gemini-3-pro-preview (用於複雜推理與深度風險評估)
 * 2. gemini-3-flash-preview (用於平衡的文本任務)
 * 3. gemini-2.5-flash-preview-tts (備援選項)
 * 4. gemini-flash-lite-latest (極速響應備援)
 */
const MODELS_TO_TRY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-preview-tts',
  'gemini-flash-lite-latest'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 1. 取得並檢查 API 金鑰 (由系統環境注入，遵守 process.env.API_KEY 規範)
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    throw new Error("系統偵測不到 API 金鑰。請確認環境變數 'API_KEY' 配置正確。");
  }

  // 2. 格式化評估數據以供 AI 分析
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

  // 3. 執行備援迴圈，確保服務可用性
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[Gemini SDK] 正在呼叫模型: ${modelName}`);
      
      // 規範：每次發起請求前使用 new GoogleGenAI 初始化
      const ai = new GoogleGenAI({ apiKey });
      
      // 根據指引，Gemini 3 系列支援思考功能以提高分析品質
      const isAdvancedModel = modelName.includes('gemini-3') || modelName.includes('gemini-2.5');
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          ...(isAdvancedModel ? { thinkingConfig: { thinkingBudget: 2000 } } : {})
        },
      });

      // 遵守規範：使用 .text 屬性獲取字串內容
      if (response && response.text) {
        console.log(`[Gemini SDK] 模型 ${modelName} 成功生成報告。`);
        return response.text;
      }
      
      throw new Error("模型回應異常：空內容");
    } catch (err: any) {
      lastError = err;
      const errorMsg = err.message || "";
      console.warn(`[Gemini SDK] 模型 ${modelName} 調用失敗: ${errorMsg}`);
      
      // 若為授權或金鑰錯誤，不進行後續重試
      if (errorMsg.includes('403') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('permission')) {
        throw new Error("API 金鑰驗證失敗。請確認 Google AI Studio 金鑰有效且具備足夠權限。");
      }
      
      // 429 或 5xx 錯誤則嘗試下一個備援模型
    }
  }

  // 4. 全數嘗試失敗
  throw new Error(`生成分析報告失敗：所有嘗試的模型均無法提供服務。最後錯誤：${lastError?.message || "網路通訊異常"}`);
};

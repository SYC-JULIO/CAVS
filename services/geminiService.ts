
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, ReportParts } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照任務類型與 SDK 指引設定模型嘗試順序
 */
const MODELS_TO_TRY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite-latest'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<ReportParts> => {
  // Directly access the API key from environment variables
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    throw new Error("系統偵測不到有效的 API 金鑰。請確保環境變數 'API_KEY' 已正確配置。");
  }

  // 格式化評估數據
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
  
  const systemInstruction = `您是「共居住宅」的資深生活管家總管。請根據提供數據生成 JSON 格式報告。
語氣：專業理性但溫暖。
⚠️ 禁語：嚴格禁止出現「照護」、「醫療」、「患者」、「病人」等醫療化詞彙。請改用「生活協助」、「管家介入」、「個案」、「長輩」等。`;

  const prompt = `
**【個案資料】**
* 姓名：${data.personalDetails.name} | 房間：${data.personalDetails.roomNumber || '未安排'}
* 心理危機燈號：${data.crisisStatus} (檢出：${detectedCrisis || '無'})
* 性格行為型態：${data.personalityType}
* 四大面向風險得分：
    * ${dimInfo}
* 背景與簡述：${data.personBrief || '無提供'}
* 其他質性描述：${data.qualitativeAnalysis || '無'}

請針對以下三個部分生成 Markdown 格式的內容：
1. **crisisAdvice (心理危機處置建議)**：針對檢出的心理危機與「${data.personalityType}」特徵，給予生活管家應對指引。
2. **riskStrategy (風險管理策略)**：結合最高風險面向「${highestDimName}」，標註粗體安全警示項目，針對其行為特性提供管理心法。
3. **benefitAnalysis (服務預期產生效益)**：使用條列式呈現 ◆ [潛在問題]：藉由 [管家介入手段]，期待 [改善效益]。嚴禁使用表格。
`;

  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      // Create a new instance with the API key from environment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crisisAdvice: { type: Type.STRING, description: "心理危機處置建議的 Markdown 內容" },
              riskStrategy: { type: Type.STRING, description: "風險管理策略的 Markdown 內容" },
              benefitAnalysis: { type: Type.STRING, description: "服務預期產生效益的 Markdown 內容" }
            },
            required: ["crisisAdvice", "riskStrategy", "benefitAnalysis"]
          },
          // Use appropriate thinking budget for supported models
          thinkingConfig: { thinkingBudget: modelName === 'gemini-3-pro-preview' ? 32768 : 24576 }
        },
      });

      // Directly access .text property from the response object
      if (response && response.text) {
        return JSON.parse(response.text.trim()) as ReportParts;
      }
      throw new Error("模型回應內容為空");
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini SDK] 模型 ${modelName} 失敗: ${err.message}`);
      if (err.message?.includes('403') || err.message?.includes('API_KEY_INVALID')) {
        throw new Error("API 金鑰驗證失敗。");
      }
    }
  }

  throw new Error(`分析報告生成失敗：${lastError?.message}`);
};

import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依照任務複雜度選擇適當模型
 * 複雜文本任務建議使用 gemini-3-pro-preview
 */
const MODEL_NAME = 'gemini-3-pro-preview';

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
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

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    if (response && response.text) {
      return response.text;
    } else {
      throw new Error("AI 回傳了空的結果");
    }
  } catch (error: any) {
    const message = error.message || "未知錯誤";
    console.error(`[API Error] ${message}`);
    throw new Error(message);
  }
};
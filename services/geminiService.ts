
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

const FALLBACK_MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // Use a temporary variable to access process.env.API_KEY to prevent potential reference errors
  // while strictly following the instruction to obtain the key exclusively from this variable.
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey as string });

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

您是「共居住宅」的**資深生活管家總管**（Senior Life Manager）。
您的語氣必須設定為：「像家人一樣的關心，但保持抽離的專業理性」。
*   **語氣風格**：以理性分析為主，感性關懷為輔。
*   **任務目標**：根據評估數據，為這位住戶生成一份專業的「生活服務建議報告」。

**【環境背景設定】**
*   居住環境為「共居住宅」，配套有「日照中心」。
*   強調由「生活管家」來串聯居住與活動。

**【個案基本資料】**
* 姓名：${data.personalDetails.name}
* 房間：${data.personalDetails.roomNumber || '未安排'}
* 性別：${data.personalDetails.gender}
* 年齡：${data.personalDetails.age}

**【人物簡述與事件背景】**
${data.personBrief || '無提供'}

**【心理危機檢出 (重要警示)】**
* 心理危機燈號：${data.crisisStatus === 'Red' ? '🔴 高度風險' : data.crisisStatus === 'Yellow' ? '🟡 中度風險' : '🟢 穩定'}
* 異常項目檢出：
${detectedCrisis || '無顯著異常項目'}

**【風險分析數據】**
1.  **總體風險狀態：** ${data.riskLevel}
2.  **四大面向得分：**
    * ${dimInfo}
3.  **最高風險面向：** ${highestDimName}
4.  **高度風險項目檢出：**
${highRiskAnswers || '無'}
5.  **其他描述：**
${data.qualitativeAnalysis}

---

**【輸出建議結構要求】**

請務必以「您好。」作為回應的開頭。

### 一、心理危機警示與處置 (若非綠燈請置頂標註)
* 分析心理危機判定結果。若為紅燈或黃燈，請給予最直接、嚴肅的管家對策建議。

### 二、狀態總評與居住建議
* 結合「人物簡述」與「風險數據」。
* **管家觀點與居住建議：** 使用客觀方式說明。

### 三、風險管理與管家應對策略
* **生活管家介入方式：** 具體描述管家會如何觀察、引導、陪伴或協調。
* **安全警示：** 若有遊走、攻擊、跌倒或自殺風險，請以粗體標示。

### 四、服務預期產生效益 (嚴格規範)
* ⚠️ 禁語：禁止使用「護理」、「照護」、「醫療」。
* 格式：\`◆[潛在風險/問題]：藉由[生活管家介入手段]，期待[具體改善效益]\`
  `;

  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      if (response.text) return response.text;
      else throw new Error('Empty response from AI model');
    } catch (error: any) {
      console.error(`Error with model ${model}:`, error);
      lastError = error;
    }
  }
  
  throw new Error("目前系統忙碌或額度已滿。詳細原因：" + (lastError?.message || "未知錯誤"));
};

import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format high risk answers for the prompt
  const highRiskAnswers = Object.entries(data.answers)
    .filter(([_, level]) => level === 'high')
    .map(([id]) => {
      const q = QUESTIONS.find(q => q.id === parseInt(id));
      return q ? `${q.id}. ${q.text} (高度)` : '';
    })
    .filter(s => s !== '')
    .join('\n');

  // Format dimensions
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

您是「住戶狀態評估與決策支援系統」的資深 AI 顧問。您的任務是根據提供的評估數據，為機構住戶或居家個案生成專業的「照顧建議與指引」。

**【個案基本資料】**
* 姓名：${data.personalDetails.name}
* 性別：${data.personalDetails.gender}
* 年齡：${data.personalDetails.age}

**【風險分析數據】**

1.  **總體風險狀態：** ${data.riskLevel === 'Red' ? '紅燈 (高度風險)' : data.riskLevel === 'Yellow' ? '黃燈 (中度風險)' : '綠燈 (低度風險)'}
2.  **四大面向得分與燈號 (綠0-10, 黃11-25, 紅26+)：**
    * ${dimInfo}
3.  **最高風險面向：** ${highestDimName}
4.  **高度風險項目檢出 (個別題目回答為高度)：**
${highRiskAnswers || '無高度風險項目'}

5.  **個案特殊狀態描述 (質性分析)：**
${data.qualitativeAnalysis}

---

**【輸出建議結構要求】**

**請務必以「您好。」作為回應的開頭。**

請以專業、溫暖且具體的語氣，按照以下結構完整輸出建議：

### 一、狀態總評與居住建議

* **總體風險判讀：** 綜合各面向分數與質性描述，簡述個案目前的整體狀態。
* **人員陪伴與居住建議：** 根據風險燈號，具體建議居住型態（如：適合護理之家、或居家需24小時陪伴等）。若有紅燈面向，請強調陪伴的必要性。
* **首要介入焦點：** 針對分數最高的面向，提出一個核心的改善或維持目標。

### 二、風險管理與行為應對

* **重點風險應對：** 針對「高度風險項目」或「紅燈/黃燈面向」，列出3-4點具體的照顧技巧或預防措施。
* **安全警示：** 若有遊走、攻擊、跌倒或自傷風險，請以粗體標示特別安全規範。

### 三、生活支持與個別化建議

* **生活照顧指引：** 結合「質性分析」內容，提供飲食、睡眠、社交活動的具體建議。
* **建議導入資源：** 根據個案弱項，推薦適合的加值服務類型（例如：增加復健頻率、夜間加強看視、或是認知活動課程），幫助家屬或機構決策。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "無法生成報告，請重試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

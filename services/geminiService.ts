
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
      return q ? `${q.id}. ${q.text} (選擇：${q.options.high})` : '';
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
  
  // Check Q18 for financial stress (High risk on Q18 means "入不敷出")
  const isFinancialStressHigh = data.answers[18] === 'high';

  const prompt = `
**【角色與任務設定】**

您是「共居住宅」的**資深生活管家總管**（Senior Life Manager）。
您的語氣必須設定為：「像家人一樣的關心，但保持抽離的專業理性」。
*   **語氣風格**：以理性分析為主，感性關懷為輔。請避免過度熱情，而是穩重、值得信賴的生活諮詢顧問。
*   **核心價值（重要）**：請將「生活管家」塑造成解決問題的核心角色。管家不僅是協助者，更是生活品質的設計師與風險的守門員。
*   **任務目標**：根據評估數據，為這位住戶/潛在住戶生成一份專業的「生活服務建議報告」。

**【環境背景設定】**
*   個案目前的潛在居住環境為「共居住宅」。
*   該場域配套有「日照中心」課程與活動。
*   **居住建議邏輯**：
    *   除非個案處於「高度風險（紅燈）」或「家庭經濟極度困難」，否則請盡量推薦「共居住宅 + 日照課程」的模式。
    *   強調由「生活管家」來串聯居住與活動，確保長輩的生活品質。

**【個案基本資料】**
* 姓名：${data.personalDetails.name}
* 性別：${data.personalDetails.gender}
* 年齡：${data.personalDetails.age}

**【人物簡述與事件背景】**
${data.personBrief || '無提供人物簡述'}

**【風險分析數據】**
1.  **總體風險狀態：** ${data.riskLevel === 'Red' ? '紅燈 (高度風險)' : data.riskLevel === 'Yellow' ? '黃燈 (中度風險)' : '綠燈 (低度風險)'}
2.  **四大面向得分：**
    * ${dimInfo}
3.  **最高風險面向：** ${highestDimName}
4.  **高度風險項目檢出：**
${highRiskAnswers || '無高度風險項目'}
5.  **其他個案狀態描述：**
${data.qualitativeAnalysis}

---

**【輸出建議結構要求】**

請務必以「您好。」作為回應的開頭。

請按照以下結構完整輸出建議：

### 一、狀態總評與居住建議

* **總體風險判讀：** 結合「人物簡述」與「風險數據」，簡述個案目前的整體狀態。
* **管家觀點與居住建議：** 
    *   從生活管家的角度，建議適合的居住型態（如：共居住宅搭配日照活動）。
    *   若有高風險，請強調「高密度的管家關注」或「專屬管家陪伴」的重要性。
* **首要介入焦點：** 針對分數最高的面向，提出一個核心的改善目標。

### 二、風險管理與管家應對策略

* **重點風險應對：** 針對「高度風險項目」或「紅燈面向」，列出3-4點具體策略。
* **生活管家介入方式：** **(重點)** 具體描述管家會如何透過「觀察」、「引導」、「陪伴」或「協調」來降低上述風險。例如：管家會在傍晚時段加強巡視以預防黃昏症候群；管家會主動引導長輩參與社交以減少衝突。
* **安全警示：** 若有遊走、攻擊、跌倒或自傷風險，請以粗體標示。

### 三、生活支持與個別化建議

* **生活作息指引：** 提供飲食、睡眠、社交活動的具體建議。
* **建議導入資源：** 推薦適合的加值服務類型。請多提及「生活管家」能提供的服務（如：陪同、傾聽、代辦、引導參與活動）。

### 四、服務預期產生效益 (嚴格規範)

*   **⚠️ 禁語規範：** 在本段落中，**絕對禁止**使用「護理」、「照護」、「醫療」等字眼。請一律改用「專業服務」、「生活支持」、「管家協助」、「健康促進」等中性詞彙。
*   **效益分析：** 具體說明透過導入上述服務，以及「生活管家」的高頻率互動與主動關懷，預期能「改善什麼問題」以及「達成什麼生活目標」。
    *   請強調管家服務的強度如何轉化為效益。
    *   範例：「透過生活管家每日的用餐陪伴與引導，預期能改善食慾不佳的問題，並透過建立規律作息，提升夜間睡眠品質。」
    *   範例：「藉由管家主動的社交媒合，預期能降低長輩的孤獨感，並緩解對家人的情緒依賴。」
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

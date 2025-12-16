
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = process.env.API_KEY;
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

您是「共居住宅」的資深照顧管家（Care Manager）。
您的語氣必須設定為：「像家人一樣的關心，但保持抽離的專業理性」。
*   **語氣風格**：以理性分析為主，感性關懷為輔。請避免過度熱情或像機器人，而是穩重、值得信賴的諮詢顧問。
*   **任務目標**：根據評估數據，為這位住戶/潛在住戶生成一份專業的「照顧建議報告」。

**【環境背景設定】**
*   個案目前的潛在居住環境為「共居住宅」。
*   該場域配套有「日照中心（Day Care Center）」課程與活動。
*   **居住建議邏輯（重要）**：
    *   除非個案處於「高度風險（紅燈）」或「家庭經濟極度困難（入不敷出）」，否則請**盡量避免**建議長照機構（如護理之家）。
    *   優先建議利用「共居住宅」搭配「日照中心課程」或「居家服務」來滿足照顧需求。

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

* **總體風險判讀：** 結合「人物簡述」與「風險數據」，簡述個案目前的整體狀態。請用理性但溫暖的口吻。
* **人員陪伴與居住建議：** 根據燈號提供居住型態建議。若非紅燈高風險，請優先推薦「共居住宅 + 日照活動」的模式。若有紅燈，請強調「高密度陪伴」的必要性。
* **首要介入焦點：** 針對分數最高的面向，提出一個核心的改善目標。

### 二、風險管理與行為應對

* **重點風險應對：** 針對「高度風險項目」或「紅燈面向」，列出3-4點具體的照顧技巧。
* **安全警示：** 若有遊走、攻擊、跌倒或自傷風險，請以粗體標示。

### 三、生活支持與個別化建議

* **生活照顧指引：** 提供飲食、睡眠、社交活動的具體建議。
* **建議導入資源：** 推薦適合的加值服務類型（例如：增加復健頻率、夜間加強看視、或是認知活動課程）。

### 四、服務預期產生效益

*   針對上述建議導入的資源與服務，具體說明「預期能改善的問題」以及「預期達成的目標」（例如：透過參加日照課程，預期改善白日嗜睡問題，並提升夜間睡眠品質）。
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

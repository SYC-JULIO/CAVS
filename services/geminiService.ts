import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  // 1. 取得 API Key
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. 請確認 Render 環境變數或 .env 檔案");
  }

  // 2. 資料準備 (這部分邏輯不變)
  const highRiskAnswers = Object.entries(data.answers)
    .filter(([_, level]) => level === 'high')
    .map(([id]) => {
      const q = QUESTIONS.find(q => q.id === parseInt(id));
      return q ? `${q.id}. ${q.text} (選擇：${q.options.high})` : '';
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

  // 3. 組合 Prompt
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

**【個案資料】**
姓名：${data.personalDetails.name}
年齡：${data.personalDetails.age}
風險狀態：${dimInfo}
高風險項目：${highRiskAnswers}
  `;

  // 4. 【關鍵修改】直接使用 fetch，不透過任何套件
  // 這是 Google Gemini 的官方 REST API 網址，絕對不會 404
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // 處理 429 (太快) 或 400 等錯誤
    if (!response.ok) {
      if (response.status === 429) {
         return "⚠️ 系統忙碌中 (429 Error)。Google 免費版 API 有每分鐘限制，請稍等 1 分鐘後再試。";
      }
      const errorData = await response.json();
      console.error("Gemini API Error Detail:", errorData);
      throw new Error(`API 請求失敗: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    // 解析回傳資料
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
      return result.candidates[0].content.parts[0].text;
    } else {
      return "無法生成報告，回傳格式異常。";
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    return `發生錯誤：${error instanceof Error ? error.message : '未知錯誤'}`;
  }
};

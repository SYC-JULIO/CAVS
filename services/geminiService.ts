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
您是「共居住宅」的**資深生活管家總管**。
(此處省略中間Prompt，請保留你原本的Prompt內容，為了版面我先縮減...)

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

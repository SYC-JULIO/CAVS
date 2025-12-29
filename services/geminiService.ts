
import { GoogleGenAI } from "@google/genai";
import { AssessmentData } from "../types";
import { QUESTIONS, DIMENSION_NAMES, CRISIS_QUESTIONS } from "../constants";
import { getDimensionRiskLevel } from "../utils/scoring";

/**
 * 依序嘗試使用者指定之備援模型鏈
 * 採用更穩定的 SDK 識別碼
 */
const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite-latest',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-flash-latest',
  'gemini-3-flash-preview',
  'gemini-robotics-er-1.5-preview',
  'gemma-3-12b'
];

export const generateCareAdvice = async (data: AssessmentData): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  // 如果完全找不到 Key，拋出 AUTH_REQUIRED 讓前端處理
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    console.error("Critical: API_KEY is missing in process.env");
    throw new Error("AUTH_REQUIRED");
  }

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
您是「共居住宅」的資深生活管家總管。請根據以下數據生成報告。
語氣：理性、專業、像家人的關心。
開頭請務必使用「您好。」

**【個案資料】**
* 姓名：${data.personalDetails.name} | 房間：${data.personalDetails.roomNumber || '未安排'} | 性別：${data.personalDetails.gender} | 年齡：${data.personalDetails.age}
* 背景：${data.personBrief || '無提供'}
* 心理危機：${data.crisisStatus} (檢出項目：${detectedCrisis || '無'})
* 風險數據：${dimInfo}
* 高風險項：${highRiskAnswers || '無'}
* 備註：${data.qualitativeAnalysis}

---
【報告結構】
一、心理危機警示與處置 (若非綠燈請置頂)
二、狀態總評與居住建議
三、風險管理與管家應對策略 (標註粗體安全警示)
四、服務預期效益 (格式：◆[問題]：藉由[手段]，期待[效益])
*禁止使用「護理」、「照護」、「醫療」等詞彙。*
  `;

  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      // 每次嘗試都重新建立 instance 確保使用最新的 Key 狀態
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      if (response.text) return response.text;
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      
      // 401/403 通常代表金鑰有問題或模型不支援該金鑰
      if (error.message.includes("401") || error.message.includes("403") || error.message.includes("API key")) {
         throw new Error("AUTH_REQUIRED");
      }
    }
  }
  
  throw new Error("今日免費額度已用完，請聯繫工作人員");
};

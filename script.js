// 這裡填入您的 Render 後端網址 (注意結尾要有 /api/assess)
// 例如: const API_URL = "https://my-care-ai-backend.onrender.com/api/assess";
const API_URL = "https://cavs-1.onrender.com//api/assess"; 

// 評分矩陣 (請確保這裡有完整的 Q1-Q30 數據，這裡僅為範例 Q1)
const SCORE_MATRIX = {
    "q1": { "low": [1, 0, 2, 1], "medium": [3, 1, 3, 2], "high": [5, 3, 5, 4] },
"q2": { "low": [1, 0, 0, 0], "medium": [3, 1, 1, 1], "high": [6, 1, 2, 2] },
"q3": { "low": [2, 0, 0, 1], "medium": [4, 1, 2, 2], "high": [7, 2, 4, 3] },
"q4": { "low": [2, 0, 1, 0], "medium": [4, 1, 4, 2], "high": [5, 2, 6, 3] },
"q5": { "low": [0, 1, 0, 0], "medium": [1, 3, 2, 1], "high": [2, 5, 3, 2] },
"q6": { "low": [1, 0, 0, 1], "medium": [2, 0, 1, 3], "high": [4, 1, 2, 5] },
"q7": { "low": [1, 0, 0, 1], "medium": [3, 1, 2, 2], "high": [5, 1, 4, 4] },
"q8": { "low": [0, 1, 0, 1], "medium": [1, 2, 1, 2], "high": [2, 4, 2, 3] },
"q9": { "low": [0, 0, 0, 0], "medium": [2, 0, 1, 1], "high": [4, 2, 5, 3] },
"q10": { "low": [1, 0, 1, 2], "medium": [2, 1, 3, 2], "high": [3, 2, 6, 4] },
"q11": { "low": [1, 0, 0, 1], "medium": [3, 0, 1, 2], "high": [5, 0, 2, 4] },
"q12": { "low": [1, 1, 0, 1], "medium": [2, 1, 2, 1], "high": [4, 2, 4, 3] },
"q13": { "low": [0, 0, 0, 0], "medium": [1, 0, 0, 1], "high": [3, 1, 1, 2] },
"q14": { "low": [1, 0, 0, 1], "medium": [3, 1, 4, 2], "high": [5, 2, 6, 3] },
"q15": { "low": [2, 0, 0, 1], "medium": [4, 0, 0, 2], "high": [6, 0, 1, 4] },
"q16": { "low": [0, 1, 0, 1], "medium": [1, 2, 1, 2], "high": [2, 4, 2, 3] },
"q17": { "low": [1, 0, 0, 0], "medium": [2, 1, 1, 1], "high": [3, 1, 2, 2] },
"q18": { "low": [0, 1, 0, 1], "medium": [1, 2, 1, 2], "high": [2, 3, 2, 3] },
"q19": { "low": [0, 1, 1, 0], "medium": [1, 2, 2, 1], "high": [2, 4, 3, 2] },
"q20": { "low": [0, 0, 1, 1], "medium": [2, 0, 2, 1], "high": [3, 1, 5, 3] },
"q21": { "low": [0, 1, 0, 0], "medium": [1, 3, 1, 2], "high": [1, 5, 2, 3] },
"q22": { "low": [0, 1, 1, 0], "medium": [1, 2, 2, 1], "high": [2, 4, 3, 2] },
"q23": { "low": [0, 0, 0, 1], "medium": [1, 0, 1, 2], "high": [2, 0, 2, 3] },
"q24": { "low": [1, 0, 0, 0], "medium": [2, 0, 0, 2], "high": [3, 0, 1, 3] },
"q25": { "low": [0, 1, 0, 0], "medium": [1, 2, 1, 1], "high": [2, 4, 2, 3] },
"q26": { "low": [0, 0, 0, 0], "medium": [1, 1, 1, 1], "high": [2, 2, 1, 2] },
"q27": { "low": [0, 0, 0, 1], "medium": [1, 1, 1, 2], "high": [2, 3, 2, 3] },
"q28": { "low": [0, 1, 0, 1], "medium": [1, 2, 1, 2], "high": [2, 4, 3, 2] },
"q29": { "low": [0, 0, 0, 0], "medium": [1, 1, 1, 1], "high": [2, 2, 2, 2] },
"q30": { "low": [1, 1, 2, 1], "medium": [2, 2, 3, 2], "high": [3, 3, 5, 3] }
};

function calculateScore() {
    let totalScore = 0;
    let scoresByAspect = [0, 0, 0, 0];

    // 簡單的迴圈範例 (實際要跑 Q1-Q30)
    for (let i = 1; i <= 30; i++) {
        const qId = `q${i}`;
        const selectElement = document.getElementById(qId);
        if (selectElement && selectElement.value && SCORE_MATRIX[qId]) {
            const levels = SCORE_MATRIX[qId][selectElement.value];
            for(let j=0; j<4; j++) {
                scoresByAspect[j] += levels[j];
                totalScore += levels[j];
            }
        }
    }

    // 更新畫面分數
    const scoreSpan = document.getElementById('total_score');
    const lightSpan = document.getElementById('traffic_light');
    if(scoreSpan) scoreSpan.textContent = totalScore;

    let light = '綠燈';
    if (totalScore > 10) light = '黃燈';
    if (totalScore > 20) light = '紅燈';
    if(lightSpan) lightSpan.textContent = light;

    return { totalScore, scoresByAspect, trafficLight: light };
}

async function submitAssessment() {
    const results = calculateScore();
    const otherStatus = document.getElementById('other_status')?.value || "";
    const outputDiv = document.getElementById('advice_output');

    if(outputDiv) outputDiv.innerHTML = "正在分析中...請稍候 (可能需要 1 分鐘喚醒主機)";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                total_score: results.totalScore,
                scores_by_aspect: results.scoresByAspect,
                traffic_light: results.trafficLight,
                other_status: otherStatus,
                // 這裡可以加入更多判斷邏輯傳給後端
                highest_risk_aspect: "範例面向", 
                red_flag_items: "無"
            })
        });

        const data = await response.json();
        if (data.success && outputDiv) {
            outputDiv.innerHTML = `<h3>AI 建議結果：</h3><p>${data.advice.replace(/\n/g, '<br>')}</p>`;
        } else if (outputDiv) {
            outputDiv.innerHTML = "分析失敗：" + (data.error || "未知錯誤");
        }
    } catch (e) {
        console.error(e);
        if(outputDiv) outputDiv.innerHTML = "連線錯誤，請確認 Render 伺服器是否運作中。";
    }
}

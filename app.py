from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os

app = Flask(__name__)
CORS(app) # 允許跨域請求 (讓前端的 JavaScript 可以呼叫)

# 從環境變數中讀取 API Key
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 這裡填入您在前面步驟中設計好的、結構化的 Prompt 範本
SYSTEM_PROMPT = """
您是一位資深長照風險評估師，請根據以下數據生成客製化建議。
請嚴格按照以下結構輸出：[輸出建議結構要求...]
"""

@app.route('/api/assess', methods=['POST'])
def run_assessment():
    data = request.json
    
    # 1. 整理 AI 輸入數據
    # 這裡將前端傳來的 total_score, traffic_light, other_status 等整理成一個給 AI 閱讀的文本
    ai_input_text = f"""
    總體風險燈號: {data.get('traffic_light')} ({data.get('total_score')} 分)
    面向總分: 身體 {data['scores_by_aspect'][0]} 分, 家庭 {data['scores_by_aspect'][1]} 分, ...
    紅燈警示項目: [這裡需要前端邏輯判斷後傳來]
    個案特殊敘述: {data.get('other_status')}
    """

    # 2. 呼叫 Gemini API
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash', # 選擇高效能模型
            contents=[ai_input_text],
            config={
                "system_instruction": SYSTEM_PROMPT 
            }
        )
        
        # 3. 回傳 AI 生成的建議
        return jsonify({
            'success': True,
            'advice': response.text
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # 啟動伺服器，預設在 http://127.0.0.1:5000 運行
    app.run(debug=True)

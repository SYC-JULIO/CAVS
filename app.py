from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os

app = Flask(__name__)
CORS(app) 

# 初始化 Gemini
try:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error initializing Gemini: {e}")

# Prompt 設定
SYSTEM_PROMPT = """
您是一位富有同理心且經驗豐富的資深長照風險評估師。您的任務是根據提供的結構化數據和個案自由敘述，生成一篇專業、客製化且具體可行的「照顧建議與指引」。
請嚴格根據輸入數據進行分析，並輸出包含「總體風險判讀」、「高度風險與行為管理警示」及「客製化注意事項」的完整建議。
"""

@app.route('/', methods=['GET'])
def home():
    return "AI Service is Running!"

@app.route('/api/assess', methods=['POST'])
def run_assessment():
    data = request.json
    
    ai_input_text = f"""
    【輸入數據】
    1. 總體風險: {data.get('traffic_light')} ({data.get('total_score')} 分)
    2. 面向總分: {data.get('scores_by_aspect')}
    3. 最高風險: {data.get('highest_risk_aspect')}
    4. 紅燈項目: {data.get('red_flag_items')}
    5. 質性敘述: {data.get('other_status')}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=[ai_input_text],
            config={"system_instruction": SYSTEM_PROMPT}
        )
        return jsonify({'success': True, 'advice': response.text})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

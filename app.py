from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os

app = Flask(__name__)
CORS(app)

# 這裡會讀取 Render 設定的密碼
api_key = os.environ.get("GEMINI_API_KEY")

@app.route('/', methods=['GET'])
def home():
    return "Server is running! (AI Studio Connection)"

@app.route('/api/assess', methods=['POST'])
def assess():
    # 如果沒有 Key，回傳錯誤
    if not api_key:
        return jsonify({'error': 'API Key not found'}), 500

    try:
        client = genai.Client(api_key=api_key)
        data = request.json

        # 這裡把前端的資料轉成文字給 AI
        prompt = f"""
        角色：專業長照評估師。
        輸入資料：
        總分：{data.get('total_score')}
        燈號：{data.get('traffic_light')}
        敘述：{data.get('other_status')}

        請根據以上資料，給出專業的照顧建議。
        """

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[prompt]
        )
        return jsonify({'success': True, 'advice': response.text})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

import streamlit as st
import google.generativeai as genai
import os

# 設定頁面
st.title("我的 AI 助理")

# 取得 API Key (從 Streamlit 的 Secrets 裡拿)
api_key = st.secrets["GOOGLE_API_KEY"]
genai.configure(api_key=api_key)

# 建立模型
model = genai.GenerativeModel('gemini-pro')

# 建立輸入框
user_input = st.text_input("請輸入你的問題：")

if st.button("送出"):
    if user_input:
        response = model.generate_content(user_input)
        st.write(response.text)

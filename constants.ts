
import { QuestionConfig, ServiceItem, CrisisQuestionConfig } from './types';

export const DIMENSION_NAMES = [
  '照顧模式的複雜度', 
  '家庭溝通成本',     
  '衝突與風險管理',   
  '後續維運成本'      
];

// 心理危機判定題庫
export const CRISIS_QUESTIONS: CrisisQuestionConfig[] = [
  { id: 1, category: '高危情境', text: '重大轉折事件：個案是否剛經歷家人離世、住院、出院、跌倒受傷，或被診斷出新的重大疾病？' },
  { id: 2, category: '高危情境', text: '自尊受損反應：個案過去是否屬於「強勢性格」，且近期因失能而表現出極度的挫敗感、羞恥感或認為自己「沒用了」？' },
  { id: 3, category: '自我價值', text: '負向自我知覺：個案是否頻繁表達自己是家人的「累贅」、「包袱」或「只會拖累別人」？' },
  { id: 4, category: '情緒訊號', text: '極端情緒波動：個案是否出現異常的憤怒、挑剔，或是極度的焦慮、對身體症狀過度恐慌，且難以安撫？' },
  { id: 5, category: '行為訊號', text: '社交退縮與自我封閉：個案是否突然拒絕原本感興趣的活動，不願與人交談，甚至出現「不吃不喝」、「拒絕服藥」等消極抵抗行為？' },
  { id: 6, category: '生理警訊', text: '睡眠障礙：個案是否出現嚴重的失眠（整夜未眠、早醒）或過度嗜睡，且持續超過三天？' },
  { id: 7, category: '訣別訊號', text: '告別行為：個案是否開始整理財務、將心愛物品送人、突然交代後事，或對家人說出類似「訣別」的話語？' },
  { id: 8, category: '被動意念', text: '被動自殺意念：個案是否透露「活著沒意思」、「如果睡著不再醒來就好了」或「老天怎麼不快點帶我走」的想法？' },
  { id: 9, category: '主動意念', text: '主動自殺意念：個案是否明確表示「想死」、「想自殺」，或詢問關於死亡方式的資訊？' },
  { id: 10, category: '具體計畫', text: '具體計畫與工具：個案是否持有或試圖取得危險物品（大量藥物、農藥、繩索、刀具），或已經有具體的執行計畫？' }
];

// 30題風險評估量表
export const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    text: "進食能力（自主進食與餐具使用）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 0, 1], high: [5, 2, 0, 2] },
    options: { low: "完全獨立", medium: "需切碎或提醒", high: "需人餵食" }
  },
  {
    id: 2,
    text: "移位能力（床位、輪椅與站立）",
    weights: { low: [0, 0, 0, 0], medium: [3, 0, 2, 1], high: [6, 1, 4, 3] },
    options: { low: "完全獨立", medium: "需單人輕微扶持", high: "需兩人或機械輔助" }
  },
  {
    id: 3,
    text: "如廁能力（如廁動作、清潔與穿脫衣物）",
    weights: { low: [0, 0, 0, 0], medium: [3, 1, 0, 2], high: [6, 2, 1, 4] },
    options: { low: "完全獨立", medium: "需部分協助", high: "完全依賴他人" }
  },
  {
    id: 4,
    text: "個人衛生（洗臉、刷牙、梳頭、刮鬍）",
    weights: { low: [0, 0, 0, 0], medium: [1, 0, 0, 1], high: [3, 1, 0, 2] },
    options: { low: "完全獨立", medium: "需部分提醒", high: "完全依賴協助" }
  },
  {
    id: 5,
    text: "洗澡能力（沐浴安全與清潔）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 1, 1], high: [5, 2, 2, 3] },
    options: { low: "完全獨立", medium: "需人監測或備水", high: "需人全程協助" }
  },
  {
    id: 6,
    text: "穿脫衣服（選擇衣物與穿脫鞋襪）",
    weights: { low: [0, 0, 0, 0], medium: [2, 0, 0, 1], high: [4, 1, 1, 2] },
    options: { low: "完全獨立", medium: "需部分協助(如扣鈕扣)", high: "完全依賴協助" }
  },
  {
    id: 7,
    text: "大小便控制（括約肌控制）",
    weights: { low: [0, 0, 0, 0], medium: [4, 2, 2, 2], high: [8, 4, 5, 5] },
    options: { low: "完全正常", medium: "偶爾失禁或需導尿", high: "完全失禁或需包尿布" }
  },
  {
    id: 8,
    text: "行走平地（室內移動）",
    weights: { low: [0, 0, 0, 0], medium: [3, 0, 2, 1], high: [6, 1, 3, 3] },
    options: { low: "獨立步行", medium: "需輔具或他人扶持", high: "需依賴輪椅或臥床" }
  },
  {
    id: 9,
    text: "上下樓梯（階梯移動安全）",
    weights: { low: [0, 0, 0, 0], medium: [3, 1, 3, 1], high: [7, 2, 5, 2] },
    options: { low: "完全獨立", medium: "需扶手或人監測", high: "無法執行" }
  },
  {
    id: 10,
    text: "用藥安全（遵照醫囑服藥）",
    weights: { low: [0, 0, 0, 0], medium: [1, 1, 2, 3], high: [2, 3, 5, 6] },
    options: { low: "自行服藥", medium: "需人提醒", high: "需人代為管理/排藥" }
  },
  {
    id: 11,
    text: "財務管理（金錢處理與日常支出）",
    weights: { low: [0, 0, 0, 0], medium: [0, 2, 1, 3], high: [1, 5, 3, 7] },
    options: { low: "完全獨立", medium: "需家人協助", high: "完全由他人代管" }
  },
  {
    id: 12,
    text: "電話通訊（使用電話或社群軟體）",
    weights: { low: [0, 0, 0, 0], medium: [0, 1, 1, 1], high: [1, 2, 2, 2] },
    options: { low: "操作自如", medium: "僅能撥打常用號碼", high: "無法使用" }
  },
  {
    id: 13,
    text: "外出購物（日常用品購買）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 1, 1], high: [4, 3, 2, 2] },
    options: { low: "自行往返", medium: "需人陪同", high: "完全無法外出" }
  },
  {
    id: 14,
    text: "家事維持（清潔整理與環境衛生）",
    weights: { low: [0, 0, 0, 0], medium: [1, 1, 0, 2], high: [2, 2, 1, 4] },
    options: { low: "獨立負擔", medium: "僅能輕便家務", high: "完全無法處理" }
  },
  {
    id: 15,
    text: "準備食物（煮食或簡單備餐）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 1, 1], high: [4, 2, 2, 2] },
    options: { low: "自行下廚", medium: "僅能加熱或簡單食物", high: "需人準備" }
  },
  {
    id: 16,
    text: "短期記憶（最近發生的事、今日日期）",
    weights: { low: [0, 0, 0, 0], medium: [1, 2, 3, 2], high: [2, 5, 7, 5] },
    options: { low: "記憶力良好", medium: "偶爾忘記近期細節", high: "頻繁遺忘/無法認人" }
  },
  {
    id: 17,
    text: "空間定向感（在熟悉環境是否迷路）",
    weights: { low: [0, 0, 0, 0], medium: [1, 3, 5, 3], high: [3, 6, 10, 6] },
    options: { low: "方向感正常", medium: "陌生環境會混淆", high: "室內亦可能迷失" }
  },
  {
    id: 18,
    text: "判斷與邏輯（解決日常生活問題）",
    weights: { low: [0, 0, 0, 0], medium: [0, 2, 3, 2], high: [1, 4, 6, 4] },
    options: { low: "判斷力正常", medium: "複雜事務需人引導", high: "無法理解因果關係" }
  },
  {
    id: 19,
    text: "情緒狀態（焦慮、憂鬱、易怒）",
    weights: { low: [0, 0, 0, 0], medium: [0, 3, 4, 2], high: [1, 6, 8, 4] },
    options: { low: "穩定", medium: "偶有情緒困擾", high: "情緒極不穩定/影響他人" }
  },
  {
    id: 20,
    text: "行為問題（遊走、重複問話、激昂）",
    weights: { low: [0, 0, 0, 0], medium: [1, 4, 6, 3], high: [3, 8, 12, 6] },
    options: { low: "無特殊行為", medium: "偶有重複行為", high: "頻繁出現干擾性行為" }
  },
  {
    id: 21,
    text: "幻覺或妄想（認為有人要害他、偷東西）",
    weights: { low: [0, 0, 0, 0], medium: [0, 5, 8, 4], high: [2, 10, 15, 8] },
    options: { low: "無", medium: "輕微懷疑或短暫幻覺", high: "嚴重影響社交與生活" }
  },
  {
    id: 22,
    text: "家庭溝通（家屬間對照顧計畫的共識）",
    weights: { low: [0, 0, 0, 0], medium: [0, 5, 2, 3], high: [1, 12, 4, 6] },
    options: { low: "共識極佳", medium: "偶有意見分歧", high: "衝突頻繁/無法溝通" }
  },
  {
    id: 23,
    text: "家屬支持度（實際投入照顧的時間與意願）",
    weights: { low: [0, 0, 0, 0], medium: [1, 4, 2, 2], high: [2, 9, 4, 4] },
    options: { low: "全力支持", medium: "心有餘力不足", high: "無家屬支持/關係疏離" }
  },
  {
    id: 24,
    text: "居住環境安全（防滑、扶手、照明）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 2, 2], high: [5, 2, 4, 4] },
    options: { low: "環境極安全", medium: "部分設施不足", high: "環境充滿危險因子" }
  },
  {
    id: 25,
    text: "跌倒風險（近三個月跌倒次數）",
    weights: { low: [0, 0, 0, 0], medium: [4, 2, 3, 2], high: [10, 4, 6, 4] },
    options: { low: "無跌倒紀錄", medium: "跌倒1次", high: "跌倒2次(含)以上" }
  },
  {
    id: 26,
    text: "睡眠品質（入睡難易度、半夜清醒）",
    weights: { low: [0, 0, 0, 0], medium: [1, 2, 2, 1], high: [2, 4, 5, 3] },
    options: { low: "良好", medium: "需助眠藥物", high: "嚴重日夜顛倒" }
  },
  {
    id: 27,
    text: "聽力或視力限制（感官退化對生活影響）",
    weights: { low: [0, 0, 0, 0], medium: [2, 1, 2, 1], high: [4, 2, 4, 2] },
    options: { low: "正常或有輔具補償", medium: "影響部分社交活動", high: "嚴重阻隔外界資訊" }
  },
  {
    id: 28,
    text: "溝通表達（清楚表達需求）",
    weights: { low: [0, 0, 0, 0], medium: [1, 3, 2, 2], high: [3, 7, 4, 5] },
    options: { low: "表達清晰", medium: "詞不達意但可理解", high: "無法有效溝通" }
  },
  {
    id: 29,
    text: "社交參與（參與社團、活動意願）",
    weights: { low: [0, 0, 0, 0], medium: [0, 1, 2, 1], high: [1, 3, 4, 2] },
    options: { low: "積極參與", medium: "偶爾被動參加", high: "完全封閉/拒絕社交" }
  },
  {
    id: 30,
    text: "吞嚥功能（進食嗆咳、咳痰情形）",
    weights: { low: [0, 0, 0, 0], medium: [4, 1, 2, 2], high: [9, 2, 5, 4] },
    options: { low: "正常", medium: "偶爾嗆咳/需調整質地", high: "頻繁嗆咳/需管餵" }
  }
];

export const SERVICES_CATALOG: ServiceItem[] = [
  { id: 'pkg1', name: '服務包一 (每日約1hr)', description: '基礎關懷與生活協助', price: 10000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 1], defaultQuantity: 1 },
  { id: 'pkg2', name: '服務包二 (每日約2hr)', description: '加強生活陪伴與備餐', price: 20000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 2], defaultQuantity: 1 },
  { id: 'pkg3', name: '服務包三 (每日約3hr)', description: '深度陪伴與密集照護', price: 30000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 3], defaultQuantity: 1 },
  { id: 's_meal', name: '取餐服務(日)', description: '代取餐點(每日)', price: 100, unit: '天', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_meal_single', name: '取餐服務(餐)', description: '代取餐點(單餐)', price: 50, unit: '餐', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_bath', name: '身體清潔(沐浴)', description: '協助沐浴洗澡', price: 350, unit: '次', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_body', name: '身體照顧服務', description: '如廁、更衣、移位', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_house', name: '房務清潔', description: '環境整理、衣物清洗', price: 195, unit: '次', calculationBasis: 'per_time', recommendedFor: [0, 3], defaultQuantity: 1 },
  { id: 's_night', name: '夜間陪伴 (12hr)', description: '預防跌倒、夜間安撫', price: 2800, unit: '夜', calculationBasis: 'per_time', recommendedFor: [2, 3], defaultQuantity: 1 },
  { id: 's_med', name: '用藥管理', description: '排藥、用藥提醒', price: 100, unit: '天', calculationBasis: 'per_time', recommendedFor: [3], defaultQuantity: 1 },
  { id: 's_vitals', name: '健康量測', description: '血壓、體溫、紀錄', price: 100, unit: '次', calculationBasis: 'per_time', recommendedFor: [3], defaultQuantity: 1 },
  { id: 's_wound', name: '傷口換藥', description: '簡易傷口護理', price: 390, unit: '次', calculationBasis: 'per_time', recommendedFor: [0, 3], defaultQuantity: 1 },
  { id: 's_rehab', name: '復能活動', description: '肢體活動、肌力訓練', price: 195, unit: '半小時', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_escort', name: '陪同就醫/外出', description: '就醫陪伴、散步', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0, 1], defaultQuantity: 2 },
  { id: 's_psych', name: '心理支持', description: '傾聽、陪伴、情緒支持', price: 390, unit: '次', calculationBasis: 'per_time', recommendedFor: [2], defaultQuantity: 1 },
  { id: 's_social', name: '管家互動/社交', description: '聊天、娛樂活動', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [1, 2], defaultQuantity: 1 },
  { id: 's_consult', name: '家庭照顧諮詢', description: '資源連結、計畫擬定', price: 600, unit: '次', calculationBasis: 'per_time', recommendedFor: [1, 3], defaultQuantity: 1 },
  { id: 's_errand', name: '代購/代辦', description: '購物、領藥', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0, 1], defaultQuantity: 1 },
];

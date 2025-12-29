
import { QuestionConfig, ServiceItem, CrisisQuestionConfig } from './types';

export const DIMENSION_NAMES = [
  '照顧模式的複雜度', 
  '家庭溝通成本',     
  '衝突與風險管理',   
  '後續維運成本'      
];

export const CRISIS_QUESTIONS: CrisisQuestionConfig[] = [
  { id: 1, category: '高危情境', text: '重大轉折事件：個案是否剛經歷住院、出院、跌倒受傷，或被診斷出新的重大疾病？' },
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

export const QUESTIONS: QuestionConfig[] = [
  { id: 1, text: '需要看護協助的程度為何？', weights: { low: [1,0,2,1], medium: [3,1,3,2], high: [5,3,5,4] }, options: { low: '1-4HR/D', medium: '5-12HR', high: '13-24HR' } },
  { id: 2, text: '受照顧者目前失能程度為何？', weights: { low: [1,0,0,0], medium: [3,1,1,1], high: [6,1,2,2] }, options: { low: '助行器', medium: '行走困難', high: '臥床' } },
  { id: 3, text: '輕微失智傾向（低度）或已有明確低中高度診斷？', weights: { low: [2,0,0,1], medium: [4,1,2,2], high: [7,2,4,3] }, options: { low: '傾向或輕度', medium: '中度或中重度', high: '重度' } },
  { id: 4, text: '抗拒他人照顧行為的強度有多高？', weights: { low: [2,0,1,0], medium: [4,1,4,2], high: [5,2,6,3] }, options: { low: '不悅但配合', medium: '偶爾會拒絕', high: '完全抗拒' } },
  { id: 5, text: '家庭成員是否有溝通不良情況，負面程度為何？', weights: { low: [0,1,0,0], medium: [1,3,2,1], high: [2,5,3,2] }, options: { low: '時好時壞', medium: '不願或勉強配合', high: '時常爭吵' } },
  { id: 6, text: '是否有特殊醫療或長照資源的追蹤？', weights: { low: [1,0,0,1], medium: [2,0,1,3], high: [4,1,2,5] }, options: { low: '偶有就醫但無持續依賴(高血壓、糖尿病)', medium: '穩定醫療要定期追蹤', high: '高度依賴生活維持' } },
  { id: 7, text: '經常性緊急通報頻率為何（跌倒、走失等）？', weights: { low: [1,0,0,1], medium: [3,1,2,2], high: [5,1,4,4] }, options: { low: '一月一次', medium: '一周一次', high: '每日發生' } },
  { id: 8, text: '照顧的類型多元程度為何？', weights: { low: [0,1,0,1], medium: [1,2,1,2], high: [2,4,2,3] }, options: { low: '2類以下', medium: '2-5類', high: '6類以上' } },
  { id: 9, text: '是否具有精神、情緒或成癮議題？', weights: { low: [0,0,0,0], medium: [2,0,1,1], high: [4,2,5,3] }, options: { low: '情緒起伏但可調節', medium: '對生活產生影響', high: '影響安全與判斷' } },
  { id: 10, text: '個案過去暴力行為或危機介入的嚴重程度？', weights: { low: [1,0,1,2], medium: [2,1,3,2], high: [3,2,6,4] }, options: { low: '有但無威脅性', medium: '需安撫但無傷害', high: '難以阻止' } },
  { id: 11, text: '夜間照顧與守夜的需求程度？', weights: { low: [1,0,0,1], medium: [3,0,1,2], high: [5,0,2,4] }, options: { low: '一周一次', medium: '一周三次下', high: '每天' } },
  { id: 12, text: '失蹤、走失經驗危險程度？', weights: { low: [1,1,0,1], medium: [2,1,2,1], high: [4,2,4,3] }, options: { low: '有意識找支援', medium: '無意識移動', high: '完全無認知' } },
  { id: 13, text: '藥品及管理必要程度？', weights: { low: [0,0,0,0], medium: [1,0,0,1], high: [3,1,1,2] }, options: { low: '不愛吃藥', medium: '忘記用藥', high: '自決用藥' } },
  { id: 14, text: '對於他人攻擊行為的強度？', weights: { low: [1,0,0,1], medium: [3,1,4,2], high: [5,2,6,3] }, options: { low: '口頭程度', medium: '物理程度', high: '公危程度' } },
  { id: 15, text: '常態性管路照護的強度？', weights: { low: [2,0,0,1], medium: [4,0,0,2], high: [6,0,1,4] }, options: { low: '簡易穩定', medium: '需更換清潔', high: '多項管路' } },
  { id: 16, text: '跨系統轉介或社工長期介入的強度？', weights: { low: [0,1,0,1], medium: [1,2,1,2], high: [2,4,2,3] }, options: { low: '低度諮詢', medium: '短期跨單位', high: '多系統介入' } },
  { id: 17, text: '抗拒參與集體活動的程度？', weights: { low: [0,1,0,0], medium: [2,2,0,1], high: [3,3,1,2] }, options: { low: '願嘗試但被動', medium: '明確不參加', high: '拒絕且具敵意' } },
  { id: 18, text: '家庭的經濟負擔與壓力程度？', weights: { low: [0,1,0,1], medium: [1,2,1,2], high: [2,3,2,3] }, options: { low: '偶擔憂', medium: '維持基本', high: '入不敷出' } },
  { id: 19, text: '是否曾與照服或醫護產生糾紛？', weights: { low: [0,1,1,0], medium: [1,2,2,1], high: [2,4,3,2] }, options: { low: '發生不影響', medium: '協調後改善', high: '影響服務' } },
  { id: 20, text: '是否有自傷或自殺傾向歷史？', weights: { low: [0,0,1,1], medium: [2,0,2,1], high: [3,1,5,3] }, options: { low: '期望低', medium: '自傷言語', high: '明確行為' } },
  { id: 21, text: '原同住家屬分屬不同城市或國家？', weights: { low: [0,1,0,0], medium: [1,3,1,2], high: [1,5,2,3] }, options: { low: '不到一半', medium: '一半以上', high: '全部' } },
  { id: 22, text: '家庭代間衝突的情況？', weights: { low: [0,1,1,0], medium: [1,2,2,1], high: [2,4,3,2] }, options: { low: '意見不同', medium: '角色衝突', high: '嚴重衝突' } },
  { id: 23, text: '需要個人化輔助設備程度？', weights: { low: [1,1,0,1], medium: [3,2,1,2], high: [5,2,2,5] }, options: { low: '基本輔具', medium: '特定輔具', high: '多項專業輔具' } },
  { id: 24, text: '是否需定期復健或醫療介入的頻率？', weights: { low: [1,0,0,0], medium: [2,0,0,2], high: [3,0,1,3] }, options: { low: '偶爾', medium: '定期', high: '高頻' } },
  { id: 25, text: '是否需備用照顧人力或替班？', weights: { low: [0,1,0,0], medium: [1,2,1,1], high: [2,4,2,3] }, options: { low: '無固定', medium: '偶爾請假', high: '完全不能離開' } },
  { id: 26, text: '是否有長照2.0相關補助使用？', weights: { low: [0,0,0,0], medium: [1,1,1,1], high: [2,2,1,2] }, options: { low: '1-3級', medium: '4-6級', high: '7-8級' } },
  { id: 27, text: '是否需要明確照顧計畫與文件？', weights: { low: [0,0,0,1], medium: [1,1,1,2], high: [2,3,2,3] }, options: { low: '無需詳細', medium: '基本指引', high: '完整計畫' } },
  { id: 28, text: '是否曾涉及法律相關事件？', weights: { low: [0,1,0,1], medium: [1,2,1,2], high: [2,4,3,2] }, options: { low: '證人', medium: '民事', high: '刑事' } },
  { id: 29, text: '是否具宗教或文化照護需求？', weights: { low: [0,0,0,0], medium: [1,1,1,1], high: [2,2,2,2] }, options: { low: '需求低', medium: '需留意', high: '特別配套' } },
  { id: 30, text: '個案是否有不實指控紀錄？', weights: { low: [1,1,2,1], medium: [2,2,3,2], high: [3,3,5,3] }, options: { low: '個人誤解', medium: '不實指控', high: '明確控訴' } },
];

import { QuestionConfig, ServiceItem } from './types';

export const DIMENSION_NAMES = [
  '身體照顧負荷',
  '家庭溝通與資源',
  '精神行為風險',
  '照顧管理與安全'
];

export const SERVICES_CATALOG: ServiceItem[] = [
  // Packages
  { id: 'pkg1', name: '服務包一 (每日約1hr)', description: '基礎關懷與生活協助', price: 10000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 1], defaultQuantity: 1 },
  { id: 'pkg2', name: '服務包二 (每日約2hr)', description: '加強生活陪伴與備餐', price: 20000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 2], defaultQuantity: 1 },
  { id: 'pkg3', name: '服務包三 (每日約3hr)', description: '深度陪伴與密集照護', price: 30000, unit: '月', calculationBasis: 'per_month', recommendedFor: [0, 3], defaultQuantity: 1 },

  // Daily Living / Physical (Dimension 0)
  { id: 's_meal', name: '客製化餐食服務', description: '泥餐/低鈉/切碎 (含午晚餐)', price: 390, unit: '天', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_bath', name: '身體清潔(沐浴)', description: '協助沐浴洗澡', price: 350, unit: '次', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_body', name: '身體照顧服務', description: '如廁、更衣、移位', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_house', name: '房務清潔', description: '環境整理、衣物清洗', price: 195, unit: '次', calculationBasis: 'per_time', recommendedFor: [0, 3], defaultQuantity: 1 },
  
  // Night / Safety (Dimension 2, 3)
  { id: 's_night', name: '夜間陪伴 (12hr)', description: '預防跌倒、夜間安撫', price: 2800, unit: '夜', calculationBasis: 'per_time', recommendedFor: [2, 3], defaultQuantity: 1 },
  { id: 's_med', name: '用藥管理', description: '排藥、用藥提醒', price: 100, unit: '天', calculationBasis: 'per_time', recommendedFor: [3], defaultQuantity: 1 },
  { id: 's_vitals', name: '健康量測', description: '血壓、體溫、紀錄', price: 100, unit: '次', calculationBasis: 'per_time', recommendedFor: [3], defaultQuantity: 1 },
  
  // Medical / Professional (Dimension 0, 3)
  { id: 's_wound', name: '傷口換藥', description: '簡易傷口護理', price: 390, unit: '次', calculationBasis: 'per_time', recommendedFor: [0, 3], defaultQuantity: 1 },
  { id: 's_rehab', name: '復能運動', description: '肢體活動、肌力訓練', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0], defaultQuantity: 1 },
  { id: 's_escort', name: '陪同就醫/外出', description: '就醫陪伴、散步', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0, 1], defaultQuantity: 2 },
  
  // Psych / Social (Dimension 1, 2)
  { id: 's_psych', name: '心理支持', description: '傾聽、陪伴、情緒支持', price: 390, unit: '次', calculationBasis: 'per_time', recommendedFor: [2], defaultQuantity: 1 },
  { id: 's_social', name: '管家互動/社交', description: '聊天、娛樂活動', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [1, 2], defaultQuantity: 1 },
  { id: 's_consult', name: '家庭照顧諮詢', description: '資源連結、計畫擬定', price: 600, unit: '次', calculationBasis: 'per_time', recommendedFor: [1, 3], defaultQuantity: 1 },
  
  // Others
  { id: 's_errand', name: '代購/代辦', description: '購物、領藥', price: 390, unit: '小時', calculationBasis: 'per_time', recommendedFor: [0, 1], defaultQuantity: 1 },
];

export const QUESTIONS: QuestionConfig[] = [
  { id: 1, text: '需要看護協助的程度為何？', weights: { low: [1,0,2,1], medium: [3,1,3,2], high: [5,3,5,4] } },
  { id: 2, text: '受照顧者目前失能程度為何？', weights: { low: [1,0,0,0], medium: [3,1,1,1], high: [6,1,2,2] } },
  { id: 3, text: '輕微失智傾向（低度）或已有明確低中高度診斷？', weights: { low: [2,0,0,1], medium: [4,1,2,2], high: [7,2,4,3] } },
  { id: 4, text: '抗拒他人照顧行為的強度有多高？', weights: { low: [2,0,1,0], medium: [4,1,4,2], high: [5,2,6,3] } },
  { id: 5, text: '家庭成員是否有溝通不良情況，負面程度為何？', weights: { low: [0,1,0,0], medium: [1,3,2,1], high: [2,5,3,2] } },
  { id: 6, text: '是否有特殊醫療或長照資源的追蹤？', weights: { low: [1,0,0,1], medium: [2,0,1,3], high: [4,1,2,5] } },
  { id: 7, text: '經常性緊急通報頻率為何（跌倒、走失等）？', weights: { low: [1,0,0,1], medium: [3,1,2,2], high: [5,1,4,4] } },
  { id: 8, text: '照顧的類型多元程度為何？', weights: { low: [0,1,0,1], medium: [1,2,1,2], high: [2,4,2,3] } },
  { id: 9, text: '是否具有精神、情緒或成癮議題？', weights: { low: [0,0,0,0], medium: [2,0,1,1], high: [4,2,5,3] } },
  { id: 10, text: '個案過去暴力行為或危機介入的嚴重程度？', weights: { low: [0,0,0,0], medium: [2,1,3,2], high: [3,2,6,4] } },
  { id: 11, text: '夜間照顧與守夜的需求程度？', weights: { low: [0,0,0,0], medium: [3,0,1,2], high: [5,0,2,4] } },
  { id: 12, text: '失蹤、走失經驗危險程度？', weights: { low: [0,0,0,0], medium: [2,1,2,1], high: [4,2,4,3] } },
  { id: 13, text: '藥品及管理必要程度？', weights: { low: [0,0,0,0], medium: [1,0,0,1], high: [3,1,1,2] } },
  { id: 14, text: '對於他人攻擊行為的強度？', weights: { low: [0,0,0,0], medium: [3,1,4,2], high: [5,2,6,3] } },
  { id: 15, text: '常態性管路照護（導尿管、胃造口）的強度？', weights: { low: [0,0,0,0], medium: [4,0,0,2], high: [6,0,1,4] } },
  { id: 16, text: '跨系統轉介或社工長期介入的強度？', weights: { low: [0,0,0,0], medium: [1,2,1,2], high: [2,4,2,3] } },
  { id: 17, text: '目前居住環境是否有增加輔助的需求？', weights: { low: [0,0,0,0], medium: [2,1,1,1], high: [3,1,2,2] } },
  { id: 18, text: '家庭的經濟負擔與壓力程度？', weights: { low: [0,0,0,0], medium: [1,2,1,2], high: [2,3,2,3] } },
  { id: 19, text: '是否曾與照服或醫護產生糾紛？', weights: { low: [0,0,0,0], medium: [1,2,2,1], high: [2,4,3,2] } },
  { id: 20, text: '是否有自傷或自殺傾向歷史？', weights: { low: [0,0,0,0], medium: [2,0,2,1], high: [3,1,5,3] } },
  { id: 21, text: '原同住家屬分屬不同城市或國家？', weights: { low: [0,0,0,0], medium: [1,3,1,2], high: [1,5,2,3] } },
  { id: 22, text: '家庭代間衝突的情況（如隔代教養）？', weights: { low: [0,0,0,0], medium: [1,2,2,1], high: [2,4,3,2] } },
  { id: 23, text: '居家設施對照顧是否有支持不足的部分？', weights: { low: [0,0,0,1], medium: [1,0,1,2], high: [2,0,2,3] } },
  { id: 24, text: '是否需定期復健或醫療介入的頻率？', weights: { low: [0,0,0,0], medium: [2,0,0,2], high: [3,0,1,3] } },
  { id: 25, text: '是否需備用照顧人力或替班？', weights: { low: [0,0,0,0], medium: [1,2,1,1], high: [2,4,2,3] } },
  { id: 26, text: '是否有長照2.0相關補助使用？', weights: { low: [0,0,0,0], medium: [1,1,1,1], high: [2,2,1,2] } },
  { id: 27, text: '是否需要明確照顧計畫與文件？', weights: { low: [0,0,0,1], medium: [1,1,1,2], high: [2,3,2,3] } },
  { id: 28, text: '是否曾涉及法律相關事件（如監護、訴訟等）？', weights: { low: [0,0,0,0], medium: [1,2,1,2], high: [2,4,3,2] } },
  { id: 29, text: '是否具宗教或文化照護特別需求？', weights: { low: [0,0,0,0], medium: [1,1,1,1], high: [2,2,2,2] } },
  { id: 30, text: '個案是否有對照顧人員提出不實指控紀錄？', weights: { low: [0,0,0,0], medium: [2,2,3,2], high: [3,3,5,3] } },
];
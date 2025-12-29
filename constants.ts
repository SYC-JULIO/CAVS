
import { QuestionConfig, ServiceItem, CrisisQuestionConfig } from './types';

export const DIMENSION_NAMES = [
  '照顧模式的複雜度', 
  '家庭溝通成本',     
  '衝突與風險管理',   
  '後續維運成本'      
];

export const CRISIS_QUESTIONS: CrisisQuestionConfig[] = [
  { id: 1, category: '高危情境', text: '重大轉折事件：個案是否剛經歷家人離世、住院、出院、跌倒受傷，或被診斷出新的重大疾病？' },
  { id: 2, category: '高危情境', text: '自尊受損反應：個案過去是否屬於「強勢性格」，且近期因失能而表現出極度的挫敗感、羞恥感 or 認為自己「沒用了」？' },
  { id: 3, category: '自我價值', text: '負向自我知覺：個案是否頻繁表達自己是家人的「累贅」、「包袱」或「只會拖累別人」？' },
  { id: 4, category: '情緒訊號', text: '極端情緒波動：個案是否出現異常的憤怒、挑剔，或是極度的焦慮、對身體症狀過度恐慌，且難以安撫？' },
  { id: 5, category: '行為訊號', text: '社交退縮與自我封閉：個案是否突然拒絕原本感興趣的活動，不願與人交談，甚至出現「不吃不喝」、「拒絕服藥」等消極抵抗行為？' },
  { id: 6, category: '生理警訊', text: '睡眠障礙：個案是否出現嚴重的失眠（整夜未眠、早醒）或過度嗜睡，且持續超過三天？' },
  { id: 7, category: '訣別訊號', text: '告別行為：個案是否開始整理財務、將心愛物品送人、突然交代後事，或對家人說出類似「訣別」的話語？' },
  { id: 8, category: '被動意念', text: '被動自殺意念：個案是否透露「活著沒意思」、「如果睡著不再醒來就好了」或「老天怎麼不快點帶我走」的想法？' },
  { id: 9, category: '主動意念', text: '主動自殺意念：個案是否明確表示「想死」、「想自殺」，或詢問關於死亡方式的資訊？' },
  { id: 10, category: '具體計畫', text: '具體計畫與工具：個案是否持有或試圖取得危險物品（大量藥物、農藥、繩索、刀具），或已經有具體的執行計畫？' }
];

export const QUESTIONS: QuestionConfig[] = [
  // 第一部分：照顧需求與個案狀況 (ID 1-4)
  {
    id: 1, part: "第一部分：照顧需求與個案狀況", text: "是否已有看護協助？",
    weights: { none: [0,0,0,0], low: [2,0,0,1], medium: [4,0,0,2], high: [8,0,0,5] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { 
      none: "無看護", 
      low: "每天 1-5 HR", 
      medium: "每天 6-12 HR", 
      high: "每天 13-24 HR" 
    }
  },
  {
    id: 2, part: "第一部分：照顧需求與個案狀況", text: "受照顧者目前失能程度？ (參考 ADLs)",
    weights: { none: [0,0,0,0], low: [3,0,0,1], medium: [6,0,1,2], high: [12,0,2,4] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "生活完全自理。", low: "輕度失能（如需協助洗澡、外出，但可自行進食/如廁）。", medium: "中度失能（需他人協助移位、如廁、穿衣，部分依賴）。", high: "重度失能（全癱、長期臥床、完全依賴他人照顧）。" }
  },
  {
    id: 3, part: "第一部分：照顧需求與個案狀況", text: "是否有失智傾向或明確診斷？ (參考 CDR)",
    weights: { none: [0,0,0,0], low: [2,0,2,2], medium: [4,1,5,4], high: [8,2,10,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "意識清楚，無失智跡象。", low: "疑似或極輕度（健忘，社交功能稍退，尚無走失風險）。", medium: "確診輕中度（有定向感問題、遊走、重複問話）。", high: "重度失智（無法辨識親人、完全喪失判斷力、BPSD行為嚴重）。" }
  },
  {
    id: 4, part: "第一部分：照顧需求與個案狀況", text: "照顧行為是否常遭拒絕？",
    weights: { none: [0,0,0,0], low: [1,1,2,2], medium: [3,2,5,4], high: [6,4,10,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "配合度高。", low: "偶爾碎念或口頭拒絕，但安撫後可執行。", medium: "頻繁拒絕特定項目（如不肯洗澡、不肯吃藥），需耗時溝通。", high: "激烈抗拒（包含推打、緊閉門戶），導致照顧無法執行。" }
  },
  // 第二部分：家庭動力與溝通 (ID 5, 8, 21, 22)
  {
    id: 5, part: "第二部分：家庭動力與溝通", text: "家庭成員溝通情形？（家庭成員溝通難度）",
    weights: { none: [0,0,0,0], low: [0,3,1,2], medium: [0,7,2,4], high: [1,15,4,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "溝通順暢，意見一致。", low: "意見偶有分歧，但主要決策者（Key Man）可定案。", medium: "主要照顧者與其他家屬意見不合，溝通成本高，決策緩慢。", high: "家庭成員完全對立、互相推諉或斷絕聯絡，無人能做主。" }
  },
  {
    id: 8, part: "第二部分：家庭動力與溝通", text: "照顧資訊回報需求？（多次與家屬回應）",
    weights: { none: [0,0,0,0], low: [0,2,0,3], medium: [0,4,1,6], high: [0,8,2,12] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "單一窗口，信任照顧者，無需頻繁回報。", low: "需每日固定簡單回報（如Line群組報平安）。", medium: "需多位家屬分別回報，或對細節要求較多（如拍照、錄影）。", high: "家屬焦慮度極高，隨時致電檢查，要求極為瑣碎且不信任回報。" }
  },
  {
    id: 21, part: "第二部分：家庭動力與溝通", text: "家屬是否分屬不同城市或國家？",
    weights: { none: [0,0,0,0], low: [0,2,0,1], medium: [0,4,0,3], high: [0,8,0,6] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "同住或居住於同一社區。", low: "居住於同一縣市，車程1小時內可達。", medium: "跨縣市居住，但在台灣本島內，返家需安排。", high: "主要決策者或子女長期居住於國外，無法立即趕回。" }
  },
  {
    id: 22, part: "第二部分：家庭動力與溝通", text: "家庭是否有代間衝突（如隔代教養、婆媳問題）？",
    weights: { none: [0,0,0,0], low: [0,2,1,1], medium: [0,5,3,2], high: [0,10,6,4] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無明顯衝突。", low: "觀念不同（如飲食習慣），有些許口角但無礙照顧。", medium: "關係緊張，照顧者夾在中間難做人，影響照顧情緒。", high: "嚴重衝突與敵視，拒絕見面或溝通，直接阻礙照顧介入。" }
  },
  // 第三部分：醫療與安全風險 (ID 6, 7, 9, 12, 14, 20, 24)
  {
    id: 6, part: "第三部分：醫療與安全風險", text: "是否需追蹤特殊醫療或長照資源？",
    weights: { none: [0,0,0,0], low: [1,1,1,1], medium: [2,2,3,3], high: [4,4,6,6] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "僅需一般慢性病拿藥。", low: "需定期（如每3個月）回診追蹤單一科別。", medium: "多重共病，需頻繁回診或復健（每月2次以上）。", high: "病情不穩，隨時需急診，或需特殊儀器（如呼吸器）追蹤。" }
  },
  {
    id: 7, part: "第三部分：醫療與安全風險", text: "是否需經常性緊急通報（跌倒、走失等）？",
    weights: { none: [0,0,0,0], low: [2,1,2,2], medium: [5,2,5,5], high: [10,4,10,10] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "過去一年無發生。", low: "偶有小狀況（如皮膚輕微擦傷、自行離家但在附近）。", medium: "半年內曾發生跌倒就醫或走失報警紀錄。", high: "高頻率發生（每月），屬高風險個案。" }
  },
  {
    id: 9, part: "第三部分：醫療與安全風險", text: "是否伴隨精神、情緒或成癮議題？",
    weights: { none: [0,0,0,0], low: [0,1,3,1], medium: [1,2,7,3], high: [2,4,15,6] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "情緒穩定。", low: "偶有情緒低落或焦慮，輕微菸酒習慣。", medium: "有憂鬱/躁鬱診斷服藥中，或有酗酒/藥物依賴影響作息。", high: "精神症狀急性發作期（幻覺、妄望），或成癮導致無法自理。" }
  },
  {
    id: 12, part: "第三部分：醫療與安全風險", text: "是否曾有失蹤、走失經驗？",
    weights: { none: [0,0,0,0], low: [1,1,3,2], medium: [3,2,8,4], high: [6,4,15,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無。", low: "曾迷路但在短時間內自行找回或鄰居帶回。", medium: "曾報警協尋，或需配戴GPS定位裝置。", high: "頻繁企圖外出遊走，且無定向感，極高走失風險。" }
  },
  {
    id: 14, part: "第三部分：醫療與安全風險", text: "是否有身體攻擊行為？（自傷或傷人）",
    weights: { none: [0,0,0,0], low: [1,2,5,3], medium: [3,4,10,6], high: [6,8,20,12] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無。", low: "口頭威脅或輕微肢體碰觸（拍打、抓捏）。", medium: "具攻擊意圖的推擠、丟擲物品，造成他人輕傷。", high: "持械攻擊、嚴重肢體暴力，造成他人受傷需就醫。" }
  },
  {
    id: 20, part: "第三部分：醫療與安全風險", text: "是否有自傷或自殺傾向歷史？",
    weights: { none: [0,0,0,0], low: [0,2,5,3], medium: [1,5,12,6], high: [3,10,25,12] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無。", low: "口頭表達活得沒意思，但無具體計畫。", medium: "曾有自傷紀錄，或近期情緒極度不穩。", high: "近期有具體自殺計畫或嘗試，屬高自殺風險個案。" }
  },
  {
    id: 24, part: "第三部分：醫療與安全風險", text: "是否需定期復健或醫療介入？",
    weights: { none: [0,0,0,0], low: [2,0,1,1], medium: [4,1,2,2], high: [8,2,4,4] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "不需。", low: "居家自主復健，不需專業人員頻繁介入。", medium: "需每週外出前往醫療院所復健。", high: "需專業人員到宅執行高強度復健或醫療處置（如清創）。" }
  },
  // 第四部分：特殊護理與照顧細節 (ID 11, 13, 15, 23, 27)
  {
    id: 11, part: "第四部分：特殊護理與照顧細節", text: "是否需夜間照顧與守夜？",
    weights: { none: [0,0,0,0], low: [2,0,1,2], medium: [5,1,3,4], high: [10,2,6,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "個案可一覺到天亮。", low: "夜間需起身1次（如廁），之後可入睡。", medium: "夜間需起身2-3次，或需定時翻身拍背。", high: "日夜顛倒或需密集抽痰/照護，照顧者無法連續睡眠。" }
  },
  {
    id: 13, part: "第四部分：特殊護理與照顧細節", text: "是否需備用藥品及管理？",
    weights: { none: [0,0,0,0], low: [1,0,1,2], medium: [2,1,2,4], high: [4,2,4,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無用藥或可自行管理。", low: "需他人提醒服藥，藥量單純。", medium: "需他人協助排藥、餵藥，有多種慢性病藥物。", high: "藥物複雜（含管制藥品/胰島素），需專業監控副作用及庫存。" }
  },
  {
    id: 15, part: "第四部分：特殊護理與照顧細節", text: "是否需常態性管路照護（導尿管、胃造口、氣切）？",
    weights: { none: [0,0,0,0], low: [4,0,1,2], medium: [8,1,3,4], high: [15,2,6,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無管路。", low: "單一管路（如鼻胃管），狀況穩定。", medium: "雙重管路（如鼻胃管+導尿管），需定期護理。", high: "三管或特殊管路（如氣切、洗腎廔管），感染風險高，需專業技術。" }
  },
  {
    id: 23, part: "第四部分：特殊護理與照顧細節", text: "居家設施對照顧是否支持良好？（硬體問題）",
    weights: { none: [0,0,0,0], low: [1,1,1,2], medium: [3,2,3,4], high: [6,4,6,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無障礙環境良好。", low: "設施稍舊，但尚可使用（如一般公寓無電梯但住一樓）。", medium: "部分障礙（如門檻高、浴室無扶手、需爬樓梯）。", high: "環境惡劣（如雜物堆積、無熱水、危樓、臥室無法進輪椅）。" }
  },
  {
    id: 27, part: "第四部分：特殊護理與照顧細節", text: "是否有明確照顧計畫與文件？",
    weights: { none: [0,0,0,0], low: [0,0,0,2], medium: [1,1,1,4], high: [2,2,2,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "有完整計畫且隨時更新。", low: "有計畫但內容簡略，尚能運作。", medium: "計畫過期或與現況不符，需重新評估。", high: "完全無計畫，照顧採「見招拆招」，缺乏連續性紀錄。" }
  },
  // 第五部分：法律、經濟與社會資源 (ID 10, 16, 17, 18, 19, 25, 26, 28, 29, 30)
  {
    id: 10, part: "第五部分：法律、經濟與社會資源", text: "個案過去是否曾有暴力行為或危機介入紀錄？",
    weights: { none: [0,0,0,0], low: [0,1,2,2], medium: [1,2,5,4], high: [2,4,10,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無紀錄。", low: "曾有口角通報，社工評估低風險。", medium: "曾有保護令或家暴通報紀錄，目前列管中。", high: "目前處於高危機狀態，或曾因暴力行為強制就醫/服刑。" }
  },
  {
    id: 16, part: "第五部分：法律、經濟與社會資源", text: "是否需跨系統轉介或社工長期介入？",
    weights: { none: [0,0,0,0], low: [0,1,1,2], medium: [0,2,3,4], high: [1,4,6,8] },
    options: { none: "無/未選", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "家庭功能良好，無需介入。", low: "需諮詢一般福利資訊。", medium: "需連結單一資源（如申請輔具、送餐）。", high: "多重問題家庭，需跨醫療、社政、警政共同介入（高關懷）。" }
  },
  {
    id: 17, part: "第五部分：法律、經濟與社會資源", text: "居住環境是否安全？",
    weights: { none: [0,0,0,0], low: [0,0,1,1], medium: [1,1,2,3], high: [2,2,4,6] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "安全舒適。", low: "衛生習慣稍差，有異味但無立即危險。", medium: "囤積物品影響動線，或水電設施有部分損壞。", high: "極度髒亂（蟲鼠患）、結構危險、或有人身安全疑慮（如出入份子複雜）。" }
  },
  {
    id: 18, part: "第五部分：法律、經濟與社會資源", text: "家庭是否具經濟負擔與壓力？",
    weights: { none: [0,0,0,0], low: [0,1,0,2], medium: [0,3,1,4], high: [0,6,2,8] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "經濟寬裕。", low: "收支平衡，偶有緊繃但可度過。", medium: "低收入戶或中低收入戶，需依賴補助維持照顧。", high: "經濟破產、負債累累，無力支付基本醫療與照顧費用。" }
  },
  {
    id: 19, part: "第五部分：法律、經濟與社會資源", text: "是否曾與照服或醫護產生糾紛？",
    weights: { none: [0,0,0,0], low: [0,1,1,3], medium: [0,3,2,6], high: [1,6,4,12] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "關係良好。", low: "曾有誤會但已化解，稍有防衛心。", medium: "曾更換服務單位，或有具體客訴紀錄。", high: "即戰力高（奧客），習慣性投訴、威脅提告，被列為拒絕往來戶。" }
  },
  {
    id: 25, part: "第五部分：法律、經濟與社會資源", text: "是否需備用照顧人力或替班？",
    weights: { none: [0,0,0,0], low: [0,1,0,1], medium: [1,2,0,3], high: [2,4,0,6] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "主要照顧者人力充足。", low: "偶爾需要（如主顧者每週休息半天）。", medium: "主顧者高齡或健康不佳，隨時可能倒下，需預備人力。", high: "無固定替手，一旦主顧者請假/生病，照顧立即開天窗。" }
  },
  {
    id: 26, part: "第五部分：法律、經濟與社會資源", text: "是否有長照2.0相關補助使用？",
    weights: { none: [0,0,0,0], low: [1,1,0,0], medium: [3,2,0,1], high: [6,4,0,2] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "未使用或資格不符。", low: "僅使用單一項目（如僅輔具補助）。", medium: "使用居家服務或日照中心（CMS 2-4級）。", high: "重度使用多項額度（CMS 7-8級），高度依賴政府資源。" }
  },
  {
    id: 28, part: "第五部分：法律、經濟與社會資源", text: "是否曾涉及法律相關事件（如監護、訴訟等）？",
    weights: { none: [0,0,0,0], low: [0,1,0,2], medium: [0,3,1,5], high: [0,6,2,10] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無。", low: "處理遺產或財產繼承中，無爭議。", medium: "正在進行監護宣告流程，或有財務糾紛。", high: "涉及刑事訴訟、虐待調查或與照顧有關的法律戰。" }
  },
  {
    id: 29, part: "第五部分：法律、經濟與社會資源", text: "是否具宗教或文化照護特別需求？",
    weights: { none: [0,0,0,0], low: [0,1,0,1], medium: [1,2,0,2], high: [2,4,0,4] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無特殊禁忌。", low: "飲食禁忌（如不吃牛、素食）。", medium: "需特定時間祈禱、特定性別工作人員。", high: "宗教/文化信仰強烈干涉醫療決策（如拒絕輸血、拒絕西醫）。" }
  },
  {
    id: 30, part: "第五部分：法律、經濟與社會資源", text: "個案是否有對照顧人員提出不實指控紀錄？",
    weights: { none: [0,0,0,0], low: [0,1,2,3], medium: [1,2,5,6], high: [2,4,10,12] },
    options: { none: "無/良好", low: "輕微", medium: "中等", high: "嚴重" },
    descriptions: { none: "無。", low: "記憶模糊導致的誤會（如以為錢包不見）。", medium: "曾指控偷竊或虐待，經查證為誤會，但頻率較高。", high: "習慣性妄想並報警指控照顧者，造成照顧者極大法律風險。" }
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

/**
 * Ta-form (thể た) verb conjugation data for N5-N4 level.
 * Each verb includes full metadata for practice exercises, grammar examples, and explanations.
 */

export interface TaFormVerb {
  id: string;
  kanji: string;        // Dạng ます có Kanji: 買います
  hiragana: string;     // Dạng ます Hiragana: かいます
  taForm: string;       // Thể た Hiragana: かった
  taFormKanji: string;  // Thể た có Kanji: 買った
  meaning: string;      // Nghĩa tiếng Việt
  hanViet: string;      // Âm Hán Việt
  group: 1 | 2 | 3;    // Nhóm động từ (1, 2, hoặc 3)
  endingBefore: string; // Ký tự trước ます
  rule: string;         // Quy tắc chia cụ thể
  exampleSentence?: string; // Mẫu câu ứng dụng thể た
  exampleMeaning?: string;  // Nghĩa mẫu câu
}

// ── Quy tắc chia theo nhóm ────────────────────────────────────────
export const TA_FORM_RULES: Record<string, string> = {
  // Nhóm 1
  'g1_tta': 'Nhóm 1: Kết thúc い・ち・り → Bỏ ます, thay bằng った',
  'g1_nda': 'Nhóm 1: Kết thúc み・び・に → Bỏ ます, thay bằng んだ',
  'g1_ita': 'Nhóm 1: Kết thúc き → Bỏ ます, thay bằng いた',
  'g1_ida': 'Nhóm 1: Kết thúc ぎ → Bỏ ます, thay bằng いだ',
  'g1_shita': 'Nhóm 1: Kết thúc し → Bỏ ます, thay bằng した',
  'g1_exception': 'Nhóm 1 (Ngoại lệ): 行きます → 行った (không theo quy tắc き→いた)',
  // Nhóm 2
  'g2': 'Nhóm 2: Bỏ ます, thêm た',
  // Nhóm 3
  'g3_suru': 'Nhóm 3: します → した (bất quy tắc)',
  'g3_kuru': 'Nhóm 3: 来ます (きます) → 来た (きた) (bất quy tắc)',
};

// ── Nhóm 1: い、ち、り → った ──────────────────────────────────────
const GROUP1_TTA: TaFormVerb[] = [
  { id: 'kau', kanji: '買います', hiragana: 'かいます', taForm: 'かった', taFormKanji: '買った', meaning: 'Mua', hanViet: 'MÃI', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: '新しい スマホを 買った ことがあります。', exampleMeaning: 'Tôi đã từng mua điện thoại thông minh mới.' },
  { id: 'au', kanji: '会います', hiragana: 'あいます', taForm: 'あった', taFormKanji: '会った', meaning: 'Gặp', hanViet: 'HỘI', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'きのう 先生に 会いました。', exampleMeaning: 'Hôm qua tôi đã gặp thầy cô.' },
  { id: 'iu', kanji: '言います', hiragana: 'いいます', taForm: 'いった', taFormKanji: '言った', meaning: 'Nói', hanViet: 'NGÔN', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: '田中さんが そう 言いました。', exampleMeaning: 'Anh Tanaka đã nói như thế.' },
  { id: 'tsukau', kanji: '使います', hiragana: 'つかいます', taForm: 'つかった', taFormKanji: '使った', meaning: 'Sử dụng', hanViet: 'SỬ', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'この パソコンを 使った ことがありますか。', exampleMeaning: 'Bạn đã từng sử dụng máy tính này chưa?' },
  { id: 'arau', kanji: '洗います', hiragana: 'あらいます', taForm: 'あらった', taFormKanji: '洗った', meaning: 'Rửa', hanViet: 'TẨY', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'ごはんを 食べる 前に 手を 洗った。', exampleMeaning: 'Trước khi ăn cơm tôi đã rửa tay.' },
  { id: 'morau', kanji: 'もらいます', hiragana: 'もらいます', taForm: 'もらった', taFormKanji: 'もらった', meaning: 'Nhận', hanViet: '', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'プレゼントを もらった ことがあります。', exampleMeaning: 'Tôi đã từng nhận được quà.' },
  { id: 'harau', kanji: '払います', hiragana: 'はらいます', taForm: 'はらった', taFormKanji: '払った', meaning: 'Trả (tiền)', hanViet: 'PHẤT', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'もう お金を 払いました。', exampleMeaning: 'Tôi đã trả tiền rồi.' },
  { id: 'warau', kanji: '笑います', hiragana: 'わらいます', taForm: 'わらった', taFormKanji: '笑った', meaning: 'Cười', hanViet: 'TIẾU', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'みんなで たくさん 笑った。', exampleMeaning: 'Mọi người đã cùng nhau cười rất nhiều.' },
  { id: 'suu', kanji: '吸います', hiragana: 'すいます', taForm: 'すった', taFormKanji: '吸った', meaning: 'Hút (thuốc)', hanViet: 'HẤP', group: 1, endingBefore: 'い', rule: 'g1_tta', exampleSentence: 'たばこを 吸った ことがありますか。', exampleMeaning: 'Bạn đã từng hút thuốc chưa?' },
  { id: 'matsu', kanji: '待ちます', hiragana: 'まちます', taForm: 'まった', taFormKanji: '待った', meaning: 'Đợi', hanViet: 'ĐÃI', group: 1, endingBefore: 'ち', rule: 'g1_tta', exampleSentence: '1時間も 待った。', exampleMeaning: 'Tôi đã đợi tới 1 tiếng đồng hồ.' },
  { id: 'tatsu', kanji: '立ちます', hiragana: 'たちます', taForm: 'たった', taFormKanji: '立った', meaning: 'Đứng', hanViet: 'LẬP', group: 1, endingBefore: 'ち', rule: 'g1_tta', exampleSentence: '電車で ずっと 立っていた。', exampleMeaning: 'Tôi đã đứng suốt trên tàu điện.' },
  { id: 'motsu', kanji: '持ちます', hiragana: 'もちます', taForm: 'もった', taFormKanji: '持った', meaning: 'Cầm, mang', hanViet: 'TRÌ', group: 1, endingBefore: 'ち', rule: 'g1_tta', exampleSentence: 'かばんを 持った。', exampleMeaning: 'Tôi đã cầm cặp sách.' },
  { id: 'tsukuru', kanji: '作ります', hiragana: 'つくります', taForm: 'つくった', taFormKanji: '作った', meaning: 'Làm, tạo ra', hanViet: 'TÁC', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '日本料理を 作った ことがあります。', exampleMeaning: 'Tôi đã từng nấu món ăn Nhật.' },
  { id: 'okuru', kanji: '送ります', hiragana: 'おくります', taForm: 'おくった', taFormKanji: '送った', meaning: 'Gửi', hanViet: 'TỐNG', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'メールを 送った。', exampleMeaning: 'Tôi đã gửi email.' },
  { id: 'kaeru', kanji: '帰ります', hiragana: 'かえります', taForm: 'かえった', taFormKanji: '帰った', meaning: 'Về (nhà)', hanViet: 'QUY', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'うちに 帰った あとで お風呂に 入る。', exampleMeaning: 'Sau khi về nhà tôi sẽ tắm bồn.' },
  { id: 'hairu', kanji: '入ります', hiragana: 'はいります', taForm: 'はいった', taFormKanji: '入った', meaning: 'Vào', hanViet: 'NHẬP', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'おんせんに 入った ことがあります。', exampleMeaning: 'Tôi đã từng vào tắm suối nước nóng Onsen.' },
  { id: 'shiru', kanji: '知ります', hiragana: 'しります', taForm: 'しった', taFormKanji: '知った', meaning: 'Biết', hanViet: 'TRI', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'ニュースを 見て 初めて 知った。', exampleMeaning: 'Xem thời sự tôi mới biết lần đầu.' },
  { id: 'kiru_cut', kanji: '切ります', hiragana: 'きります', taForm: 'きった', taFormKanji: '切った', meaning: 'Cắt', hanViet: 'THIẾT', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '紙を 切った。', exampleMeaning: 'Tôi đã cắt giấy.' },
  { id: 'hashiru', kanji: '走ります', hiragana: 'はしります', taForm: 'はしった', taFormKanji: '走った', meaning: 'Chạy', hanViet: 'TẨU', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '今朝 5キロ 走った。', exampleMeaning: 'Sáng nay tôi đã chạy 5km.' },
  { id: 'noru', kanji: '乗ります', hiragana: 'のります', taForm: 'のった', taFormKanji: '乗った', meaning: 'Lên (xe)', hanViet: 'THỪA', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '新幹線に 乗った ことがあります。', exampleMeaning: 'Tôi đã từng đi tàu siêu tốc Shinkansen.' },
  { id: 'toru', kanji: '取ります', hiragana: 'とります', taForm: 'とった', taFormKanji: '取った', meaning: 'Lấy, chụp', hanViet: 'THỦ', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '富士山で 写真を 撮った。', exampleMeaning: 'Tôi đã chụp ảnh ở núi Phú Sĩ.' },
  { id: 'suwaru', kanji: '座ります', hiragana: 'すわります', taForm: 'すわった', taFormKanji: '座った', meaning: 'Ngồi', hanViet: 'TỌA', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'いすに 座った。', exampleMeaning: 'Tôi đã ngồi xuống ghế.' },
  { id: 'tomaru', kanji: '止まります', hiragana: 'とまります', taForm: 'とまった', taFormKanji: '止まった', meaning: 'Dừng lại, trọ', hanViet: 'CHỈ', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: 'ホテルに 泊まった ことがあります。', exampleMeaning: 'Tôi đã từng trọ ở khách sạn.' },
  { id: 'wakaru', kanji: '分かります', hiragana: 'わかります', taForm: 'わかった', taFormKanji: '分かった', meaning: 'Hiểu', hanViet: 'PHÂN', group: 1, endingBefore: 'り', rule: 'g1_tta', exampleSentence: '先生の 説明が よく 分かった。', exampleMeaning: 'Tôi đã hiểu rất rõ lời giải thích của thầy.' },
];

// ── Nhóm 1: み、び、に → んだ ──────────────────────────────────────
const GROUP1_NDA: TaFormVerb[] = [
  { id: 'yomu', kanji: '読みます', hiragana: 'よみます', taForm: 'よんだ', taFormKanji: '読んだ', meaning: 'Đọc', hanViet: 'ĐỘC', group: 1, endingBefore: 'み', rule: 'g1_nda', exampleSentence: '日本の マンガを 読んだ ことがあります。', exampleMeaning: 'Tôi đã từng đọc truyện tranh Nhật Bản.' },
  { id: 'nomu', kanji: '飲みます', hiragana: 'のみます', taForm: 'のんだ', taFormKanji: '飲んだ', meaning: 'Uống', hanViet: 'ẨM', group: 1, endingBefore: 'み', rule: 'g1_nda', exampleSentence: '日本酒を 飲んだ ことがありますか。', exampleMeaning: 'Bạn đã từng uống rượu sake Nhật Bản chưa?' },
  { id: 'sumu', kanji: '住みます', hiragana: 'すみます', taForm: 'すんだ', taFormKanji: '住んだ', meaning: 'Sống, ở', hanViet: 'TRÚ', group: 1, endingBefore: 'み', rule: 'g1_nda', exampleSentence: '東京に 住んだ ことがあります。', exampleMeaning: 'Tôi đã từng sống ở Tokyo.' },
  { id: 'yasumu', kanji: '休みます', hiragana: 'やすみます', taForm: 'やすんだ', taFormKanji: '休んだ', meaning: 'Nghỉ ngơi', hanViet: 'HƯU', group: 1, endingBefore: 'み', rule: 'g1_nda', exampleSentence: 'きのう 会社を 休んだ。', exampleMeaning: 'Hôm qua tôi đã nghỉ làm.' },
  { id: 'asobu', kanji: '遊びます', hiragana: 'あそびます', taForm: 'あそんだ', taFormKanji: '遊んだ', meaning: 'Chơi', hanViet: 'DU', group: 1, endingBefore: 'び', rule: 'g1_nda', exampleSentence: '週末 友達と 遊んだ。', exampleMeaning: 'Cuối tuần tôi đã đi chơi cùng bạn bè.' },
  { id: 'yobu', kanji: '呼びます', hiragana: 'よびます', taForm: 'よんだ', taFormKanji: '呼んだ', meaning: 'Gọi', hanViet: 'HÔ', group: 1, endingBefore: 'び', rule: 'g1_nda', exampleSentence: 'タクシーを 呼んだ。', exampleMeaning: 'Tôi đã gọi xe taxi.' },
  { id: 'erabu', kanji: '選びます', hiragana: 'えらびます', taForm: 'えらんだ', taFormKanji: '選んだ', meaning: 'Chọn', hanViet: 'TUYỂN', group: 1, endingBefore: 'び', rule: 'g1_nda', exampleSentence: 'いい 会社を 選んだ。', exampleMeaning: 'Tôi đã chọn được công ty tốt.' },
  { id: 'shinu', kanji: '死にます', hiragana: 'しにます', taForm: 'しんだ', taFormKanji: '死んだ', meaning: 'Chết', hanViet: 'TỬ', group: 1, endingBefore: 'に', rule: 'g1_nda', exampleSentence: '草が 枯れて 死んだ。', exampleMeaning: 'Cây cỏ bị héo chết.' },
  { id: 'narabu', kanji: '並びます', hiragana: 'ならびます', taForm: 'ならんだ', taFormKanji: '並んだ', meaning: 'Xếp hàng', hanViet: 'TỊNH', group: 1, endingBefore: 'び', rule: 'g1_nda', exampleSentence: '店で 30分 並んだ。', exampleMeaning: 'Tôi đã xếp hàng 30 phút ở cửa hàng.' },
];

// ── Nhóm 1: き → いた ──────────────────────────────────────────────
const GROUP1_ITA: TaFormVerb[] = [
  { id: 'kaku', kanji: '書きます', hiragana: 'かきます', taForm: 'かいた', taFormKanji: '書いた', meaning: 'Viết', hanViet: 'THƯ', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: '日本語で レポートを 書いた。', exampleMeaning: 'Tôi đã viết báo cáo bằng tiếng Nhật.' },
  { id: 'kiku', kanji: '聞きます', hiragana: 'ききます', taForm: 'きいた', taFormKanji: '聞いた', meaning: 'Nghe, hỏi', hanViet: 'VĂN', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: 'J-POPを 聞いた ことがあります。', exampleMeaning: 'Tôi đã từng nghe nhạc J-POP.' },
  { id: 'aruku', kanji: '歩きます', hiragana: 'あるきます', taForm: 'あるいた', taFormKanji: '歩いた', meaning: 'Đi bộ', hanViet: 'BỘ', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: '駅から 家まで 歩いた。', exampleMeaning: 'Tôi đã đi bộ từ nhà ga về nhà.' },
  { id: 'oku', kanji: '置きます', hiragana: 'おきます', taForm: 'おいた', taFormKanji: '置いた', meaning: 'Đặt, để', hanViet: 'TRÍ', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: '机の上に 本を 置いた。', exampleMeaning: 'Tôi đã đặt cuốn sách lên bàn.' },
  { id: 'hiku', kanji: '引きます', hiragana: 'ひきます', taForm: 'ひいた', taFormKanji: '引いた', meaning: 'Kéo, đàn', hanViet: 'DẪN', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: 'ピアノを 弾いた ことがあります。', exampleMeaning: 'Tôi đã từng chơi đàn piano.' },
  { id: 'hataraku', kanji: '働きます', hiragana: 'はたらきます', taForm: 'はたらいた', taFormKanji: '働いた', meaning: 'Làm việc', hanViet: 'ĐỘNG', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: '日本で 働いた ことがあります。', exampleMeaning: 'Tôi đã từng làm việc tại Nhật Bản.' },
  { id: 'saku', kanji: '咲きます', hiragana: 'さきます', taForm: 'さいた', taFormKanji: '咲いた', meaning: 'Nở (hoa)', hanViet: 'TIẾU', group: 1, endingBefore: 'き', rule: 'g1_ita', exampleSentence: '桜の花が きれいに 咲いた。', exampleMeaning: 'Hoa anh đào đã nở rất đẹp.' },
];

// ── Nhóm 1: ぎ → いだ ──────────────────────────────────────────────
const GROUP1_IDA: TaFormVerb[] = [
  { id: 'oyogu', kanji: '泳ぎます', hiragana: 'およぎます', taForm: 'およいだ', taFormKanji: '泳いだ', meaning: 'Bơi', hanViet: 'VỊNH', group: 1, endingBefore: 'ぎ', rule: 'g1_ida', exampleSentence: '海で 泳いだ ことがあります。', exampleMeaning: 'Tôi đã từng bơi ở biển.' },
  { id: 'nugu', kanji: '脱ぎます', hiragana: 'ぬぎます', taForm: 'ぬいだ', taFormKanji: '脱いだ', meaning: 'Cởi (giày/áo)', hanViet: 'THOÁT', group: 1, endingBefore: 'ぎ', rule: 'g1_ida', exampleSentence: '玄関で 靴を 脱いだ。', exampleMeaning: 'Tôi đã cởi giày ở hiên cửa.' },
  { id: 'isogu', kanji: '急ぎます', hiragana: 'いそぎます', taForm: 'いそいだ', taFormKanji: '急いだ', meaning: 'Vội vàng', hanViet: 'CẤP', group: 1, endingBefore: 'ぎ', rule: 'g1_ida', exampleSentence: '急いで 駅へ 行った。', exampleMeaning: 'Tôi đã vội vã đi tới nhà ga.' },
];

// ── Nhóm 1: し → した ──────────────────────────────────────────────
const GROUP1_SHITA: TaFormVerb[] = [
  { id: 'hanasu', kanji: '話します', hiragana: 'はなします', taForm: 'はなした', taFormKanji: '話した', meaning: 'Nói chuyện', hanViet: 'THOẠI', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '日本人と 日本語で 話した。', exampleMeaning: 'Tôi đã nói chuyện bằng tiếng Nhật với người Nhật.' },
  { id: 'dasu', kanji: '出します', hiragana: 'だします', taForm: 'だした', taFormKanji: '出した', meaning: 'Đưa ra, nộp', hanViet: 'XUẤT', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '宿題を 出した。', exampleMeaning: 'Tôi đã nộp bài tập về nhà.' },
  { id: 'kesu', kanji: '消します', hiragana: 'けします', taForm: 'けした', taFormKanji: '消した', meaning: 'Tắt (điện)', hanViet: 'TIÊU', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '部屋の 電気を 消した。', exampleMeaning: 'Tôi đã tắt điện trong phòng.' },
  { id: 'kaesu', kanji: '返します', hiragana: 'かえします', taForm: 'かえした', taFormKanji: '返した', meaning: 'Trả lại', hanViet: 'PHẢN', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '図書館に 本を 返した。', exampleMeaning: 'Tôi đã trả sách lại cho thư viện.' },
  { id: 'osu', kanji: '押します', hiragana: 'おします', taForm: 'おした', taFormKanji: '押した', meaning: 'Ấn, đẩy', hanViet: 'ÁP', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: 'ボタンを 押した。', exampleMeaning: 'Tôi đã bấm nút.' },
  { id: 'kasu', kanji: '貸します', hiragana: 'かします', taForm: 'かした', taFormKanji: '貸した', meaning: 'Cho mượn', hanViet: 'THẢI', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '友達に 傘を 貸した。', exampleMeaning: 'Tôi đã cho bạn mượn ô.' },
  { id: 'naosu', kanji: '直します', hiragana: 'なおします', taForm: 'なおした', taFormKanji: '直した', meaning: 'Sửa chữa', hanViet: 'TRỰC', group: 1, endingBefore: 'し', rule: 'g1_shita', exampleSentence: '自転車を 自分で 直した。', exampleMeaning: 'Tôi đã tự mình sửa xe đạp.' },
];

// ── Nhóm 1: Ngoại lệ 行きます → 行った ──────────────────────────────
const GROUP1_EXCEPTION: TaFormVerb[] = [
  { id: 'iku', kanji: '行きます', hiragana: 'いきます', taForm: 'いった', taFormKanji: '行った', meaning: 'Đi', hanViet: 'HÀNH', group: 1, endingBefore: 'き', rule: 'g1_exception', exampleSentence: '日本へ 行った ことがありますか。', exampleMeaning: 'Bạn đã từng đi Nhật Bản chưa?' },
];

// ── Nhóm 2: Bỏ ます + た ───────────────────────────────────────────
const GROUP2: TaFormVerb[] = [
  { id: 'taberu', kanji: '食べます', hiragana: 'たべます', taForm: 'たべた', taFormKanji: '食べた', meaning: 'Ăn', hanViet: 'THỰC', group: 2, endingBefore: 'べ', rule: 'g2', exampleSentence: 'すしや さしみを 食べた ことがあります。', exampleMeaning: 'Tôi đã từng ăn sushi và sashimi.' },
  { id: 'miru', kanji: '見ます', hiragana: 'みます', taForm: 'みた', taFormKanji: '見た', meaning: 'Nhìn, xem', hanViet: 'KIẾN', group: 2, endingBefore: 'み', rule: 'g2', exampleSentence: '歌舞伎を 見た ことがあります。', exampleMeaning: 'Tôi đã từng xem kịch Kabuki.' },
  { id: 'okiru', kanji: '起きます', hiragana: 'おきます', taForm: 'おきた', taFormKanji: '起きた', meaning: 'Thức dậy', hanViet: 'KHỞI', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '今朝 6時に 起きた。', exampleMeaning: 'Sáng nay tôi đã thức dậy lúc 6 giờ.' },
  { id: 'neru', kanji: '寝ます', hiragana: 'ねます', taForm: 'ねた', taFormKanji: '寝た', meaning: 'Ngủ', hanViet: 'TẨM', group: 2, endingBefore: 'ね', rule: 'g2', exampleSentence: '昨夜 早く 寝た。', exampleMeaning: 'Tối qua tôi đã đi ngủ sớm.' },
  { id: 'deru', kanji: '出ます', hiragana: 'でます', taForm: 'でた', taFormKanji: '出た', meaning: 'Ra ngoài, rời', hanViet: 'XUẤT', group: 2, endingBefore: 'で', rule: 'g2', exampleSentence: '7時に 家を 出た。', exampleMeaning: 'Tôi đã ra khỏi nhà lúc 7 giờ.' },
  { id: 'akeru', kanji: '開けます', hiragana: 'あけます', taForm: 'あけた', taFormKanji: '開けた', meaning: 'Mở (cửa)', hanViet: 'KHAI', group: 2, endingBefore: 'け', rule: 'g2', exampleSentence: '窓を 開けた。', exampleMeaning: 'Tôi đã mở cửa sổ.' },
  { id: 'shimeru', kanji: '閉めます', hiragana: 'しめます', taForm: 'しめた', taFormKanji: '閉めた', meaning: 'Đóng (cửa)', hanViet: 'BẾ', group: 2, endingBefore: 'め', rule: 'g2', exampleSentence: 'ドアを 閉めた。', exampleMeaning: 'Tôi đã đóng cửa.' },
  { id: 'ireru', kanji: '入れます', hiragana: 'いれます', taForm: 'いれた', taFormKanji: '入れた', meaning: 'Cho vào', hanViet: 'NHẬP', group: 2, endingBefore: 'れ', rule: 'g2', exampleSentence: 'コーヒーに 砂糖を 入れた。', exampleMeaning: 'Tôi đã cho đường vào cà phê.' },
  { id: 'oshieru', kanji: '教えます', hiragana: 'おしえます', taForm: 'おしえた', taFormKanji: '教えた', meaning: 'Dạy, chỉ bảo', hanViet: 'GIÁO', group: 2, endingBefore: 'え', rule: 'g2', exampleSentence: '先生が 漢字を 教えてくれた。', exampleMeaning: 'Thầy giáo đã dạy chữ Hán cho tôi.' },
  { id: 'kiru_wear', kanji: '着ます', hiragana: 'きます', taForm: 'きた', taFormKanji: '着た', meaning: 'Mặc (áo)', hanViet: 'TRƯỚC', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '着物を 着た ことがあります。', exampleMeaning: 'Tôi đã từng mặc thử Kimono.' },
  { id: 'abiru', kanji: '浴びます', hiragana: 'あびます', taForm: 'あびた', taFormKanji: '浴びた', meaning: 'Tắm (vòi sen)', hanViet: 'DỤC', group: 2, endingBefore: 'び', rule: 'g2', exampleSentence: 'シャワーを 浴びた。', exampleMeaning: 'Tôi đã tắm vòi sen.' },
  { id: 'kariru', kanji: '借ります', hiragana: 'かります', taForm: 'かりた', taFormKanji: '借りた', meaning: 'Mượn', hanViet: 'TÁ', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: '図書館で 辞書を 借りた。', exampleMeaning: 'Tôi đã mượn từ điển ở thư viện.' },
  { id: 'oriru', kanji: '降ります', hiragana: 'おります', taForm: 'おりた', taFormKanji: '降りた', meaning: 'Xuống (xe)', hanViet: 'GIÁNG', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: 'バスを 降りた。', exampleMeaning: 'Tôi đã xuống xe buýt.' },
  { id: 'wasureru', kanji: '忘れます', hiragana: 'わすれます', taForm: 'わすれた', taFormKanji: '忘れた', meaning: 'Quên', hanViet: 'VONG', group: 2, endingBefore: 'れ', rule: 'g2', exampleSentence: '宿題を 忘れた。', exampleMeaning: 'Tôi đã quên bài tập.' },
  { id: 'shiraberu', kanji: '調べます', hiragana: 'しらべます', taForm: 'しらべた', taFormKanji: '調べた', meaning: 'Tra cứu', hanViet: 'ĐIỀU', group: 2, endingBefore: 'べ', rule: 'g2', exampleSentence: 'ネットで 意味を 調べた。', exampleMeaning: 'Tôi đã tra cứu ý nghĩa trên mạng.' },
  { id: 'tsukareru', kanji: '疲れます', hiragana: 'つかれます', taForm: 'つかれた', taFormKanji: '疲れた', meaning: 'Mệt mỏi', hanViet: 'BÌ', group: 2, endingBefore: 'れ', rule: 'g2', exampleSentence: 'たくさん 歩いて 疲れた。', exampleMeaning: 'Đi bộ nhiều nên tôi đã mệt.' },
  { id: 'dekiru', kanji: '出来ます', hiragana: 'できます', taForm: 'できた', taFormKanji: '出来た', meaning: 'Có thể, xong', hanViet: 'XUẤT LAI', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '料理が 出来た。', exampleMeaning: 'Món ăn đã nấu xong rồi.' },
];

// ── Nhóm 3: Bất quy tắc ─────────────────────────────────────────────
const GROUP3: TaFormVerb[] = [
  { id: 'suru', kanji: 'します', hiragana: 'します', taForm: 'した', taFormKanji: 'した', meaning: 'Làm', hanViet: '', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'サッカーを した ことがあります。', exampleMeaning: 'Tôi đã từng chơi bóng đá.' },
  { id: 'kuru', kanji: '来ます', hiragana: 'きます', taForm: 'きた', taFormKanji: '来た', meaning: 'Đến', hanViet: 'LAI', group: 3, endingBefore: 'き', rule: 'g3_kuru', exampleSentence: '日本へ 来た ばかりです。', exampleMeaning: 'Tôi vừa mới đến Nhật Bản.' },
  { id: 'benkyou', kanji: '勉強します', hiragana: 'べんきょうします', taForm: 'べんきょうした', taFormKanji: '勉強した', meaning: 'Học', hanViet: 'MIỄN CƯỜNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '昨夜 3時間 勉強した。', exampleMeaning: 'Tối qua tôi đã học 3 tiếng.' },
  { id: 'ryouri', kanji: '料理します', hiragana: 'りょうりします', taForm: 'りょうりした', taFormKanji: '料理した', meaning: 'Nấu ăn', hanViet: 'LIỆU LÝ', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '自分で 料理した。', exampleMeaning: 'Tôi đã tự mình nấu ăn.' },
  { id: 'kekkon', kanji: '結婚します', hiragana: 'けっこんします', taForm: 'けっこんした', taFormKanji: '結婚した', meaning: 'Kết hôn', hanViet: 'KẾT HÔN', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '去年 結婚した。', exampleMeaning: 'Năm ngoái tôi đã kết hôn.' },
  { id: 'sanpo', kanji: '散歩します', hiragana: 'さんぽします', taForm: 'さんぽした', taFormKanji: '散歩した', meaning: 'Đi dạo', hanViet: 'TÁN BỘ', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '公園を 散歩した。', exampleMeaning: 'Tôi đã đi dạo ở công viên.' },
  { id: 'sentaku', kanji: '洗濯します', hiragana: 'せんたくします', taForm: 'せんたくした', taFormKanji: '洗濯した', meaning: 'Giặt đồ', hanViet: 'TẨY TRẠC', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '服を 洗濯した。', exampleMeaning: 'Tôi đã giặt quần áo.' },
  { id: 'souji', kanji: '掃除します', hiragana: 'そうじします', taForm: 'そうじした', taFormKanji: '掃除した', meaning: 'Dọn dẹp', hanViet: 'TẢO TRỪ', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '部屋を 掃除した。', exampleMeaning: 'Tôi đã dọn dẹp phòng.' },
  { id: 'denwa', kanji: '電話します', hiragana: 'でんわします', taForm: 'でんわした', taFormKanji: '電話した', meaning: 'Gọi điện', hanViet: 'ĐIỆN THOẠI', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '家族に 電話した。', exampleMeaning: 'Tôi đã gọi điện về cho gia đình.' },
  { id: 'kaimono', kanji: '買い物します', hiragana: 'かいものします', taForm: 'かいものした', taFormKanji: '買い物した', meaning: 'Mua sắm', hanViet: 'MÃI VẬT', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'スーパーで 買い物した。', exampleMeaning: 'Tôi đã mua sắm ở siêu thị.' },
  { id: 'ryokou', kanji: '旅行します', hiragana: 'りょこうします', taForm: 'りょこうした', taFormKanji: '旅行した', meaning: 'Du lịch', hanViet: 'LỮ HÀNH', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '京都へ 旅行した ことがあります。', exampleMeaning: 'Tôi đã từng đi du lịch Kyoto.' },
  { id: 'renshuu', kanji: '練習します', hiragana: 'れんしゅうします', taForm: 'れんしゅうした', taFormKanji: '練習した', meaning: 'Luyện tập', hanViet: 'LUYỆN TẬP', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '毎日 発音を 練習した。', exampleMeaning: 'Hàng ngày tôi đều đã luyện phát âm.' },
  { id: 'undou', kanji: '運動します', hiragana: 'うんどうします', taForm: 'うんどうした', taFormKanji: '運動した', meaning: 'Vận động', hanViet: 'VẬN ĐỘNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'ジムで 運動した。', exampleMeaning: 'Tôi đã tập thể dục ở phòng gym.' },
  { id: 'shinpai', kanji: '心配します', hiragana: 'しんぱいします', taForm: 'しんぱいした', taFormKanji: '心配した', meaning: 'Lo lắng', hanViet: 'TÂM PHỐI', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'とても 心配した。', exampleMeaning: 'Tôi đã rất lo lắng.' },
];

// ── Export toàn bộ danh sách ─────────────────────────────────────────
export const TA_FORM_VERBS: TaFormVerb[] = [
  ...GROUP1_TTA,
  ...GROUP1_NDA,
  ...GROUP1_ITA,
  ...GROUP1_IDA,
  ...GROUP1_SHITA,
  ...GROUP1_EXCEPTION,
  ...GROUP2,
  ...GROUP3,
];

// ── Bàn phím Hiragana ảo ────────────────────────────────────────────
export const HIRAGANA_KEYBOARD_ROWS: string[][] = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', 'を', 'ん', 'っ', ''],
];

export const DAKUTEN_KEYBOARD_ROWS: string[][] = [
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
];

// ── Nhóm mô tả ───────────────────────────────────────────────────────
export const GROUP_DESCRIPTIONS: Record<number, string> = {
  1: 'Nhóm 1 (五段動詞 - Godan): Âm trước「ます」thuộc cột「い」(い段). Chia theo quy tắc đuôi (った, んだ, いた, いだ, した).',
  2: 'Nhóm 2 (一段動詞 - Ichidan): Âm trước「ます」thường thuộc cột「え」(え段). Quy tắc: Bỏ「ます」+ た.',
  3: 'Nhóm 3 (不規則動詞 - Bất quy tắc):「します」→「した」và「来ます (きます)」→「来た (きた)」.',
};

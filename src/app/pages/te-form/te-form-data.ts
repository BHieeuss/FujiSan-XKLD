/**
 * Te-form (thể て) verb conjugation data for N4-N3 level.
 * Each verb includes full metadata for practice exercises and explanations.
 */

export interface TeFormVerb {
  id: string;
  kanji: string;        // Dạng ます có Kanji: 買います
  hiragana: string;     // Dạng ます Hiragana: かいます
  teForm: string;       // Thể て Hiragana: かって
  teFormKanji: string;  // Thể て có Kanji: 買って
  meaning: string;      // Nghĩa tiếng Việt
  hanViet: string;      // Âm Hán Việt
  group: 1 | 2 | 3;    // Nhóm động từ (chỉ 1 trong 3)
  endingBefore: string; // Ký tự trước ます
  rule: string;         // Quy tắc chia cụ thể
}

// ── Quy tắc chia theo nhóm ────────────────────────────────────────
export const TE_FORM_RULES: Record<string, string> = {
  // Nhóm 1
  'g1_tte': 'Nhóm 1: Kết thúc い・ち・り → Bỏ ます, thay bằng って',
  'g1_nde': 'Nhóm 1: Kết thúc み・び・に → Bỏ ます, thay bằng んで',
  'g1_ite': 'Nhóm 1: Kết thúc き → Bỏ ます, thay bằng いて',
  'g1_ide': 'Nhóm 1: Kết thúc ぎ → Bỏ ます, thay bằng いで',
  'g1_shite': 'Nhóm 1: Kết thúc し → Bỏ ます, thêm て',
  'g1_exception': 'Nhóm 1 (Ngoại lệ): 行きます → 行って (không theo quy tắc き→いて)',
  // Nhóm 2
  'g2': 'Nhóm 2: Bỏ ます, thêm て',
  // Nhóm 3
  'g3_suru': 'Nhóm 3: します → して (bất quy tắc)',
  'g3_kuru': 'Nhóm 3: 来ます → 来て (bất quy tắc)',
};

// ── Nhóm 1: い、ち、り → って ──────────────────────────────────────
const GROUP1_TTE: TeFormVerb[] = [
  { id: 'kau', kanji: '買います', hiragana: 'かいます', teForm: 'かって', teFormKanji: '買って', meaning: 'Mua', hanViet: 'MÃI', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'au', kanji: '会います', hiragana: 'あいます', teForm: 'あって', teFormKanji: '会って', meaning: 'Gặp', hanViet: 'HỘI', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'iu', kanji: '言います', hiragana: 'いいます', teForm: 'いって', teFormKanji: '言って', meaning: 'Nói', hanViet: 'NGÔN', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'tsukau', kanji: '使います', hiragana: 'つかいます', teForm: 'つかって', teFormKanji: '使って', meaning: 'Sử dụng', hanViet: 'SỬ', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'arau', kanji: '洗います', hiragana: 'あらいます', teForm: 'あらって', teFormKanji: '洗って', meaning: 'Rửa', hanViet: 'TẨY', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'morau', kanji: 'もらいます', hiragana: 'もらいます', teForm: 'もらって', teFormKanji: 'もらって', meaning: 'Nhận', hanViet: '', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'harau', kanji: '払います', hiragana: 'はらいます', teForm: 'はらって', teFormKanji: '払って', meaning: 'Trả (tiền)', hanViet: 'PHẤT', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'warau', kanji: '笑います', hiragana: 'わらいます', teForm: 'わらって', teFormKanji: '笑って', meaning: 'Cười', hanViet: 'TIẾU', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'suu', kanji: '吸います', hiragana: 'すいます', teForm: 'すって', teFormKanji: '吸って', meaning: 'Hút (thuốc)', hanViet: 'HẤP', group: 1, endingBefore: 'い', rule: 'g1_tte' },
  { id: 'matsu', kanji: '待ちます', hiragana: 'まちます', teForm: 'まって', teFormKanji: '待って', meaning: 'Đợi', hanViet: 'ĐÃI', group: 1, endingBefore: 'ち', rule: 'g1_tte' },
  { id: 'tatsu', kanji: '立ちます', hiragana: 'たちます', teForm: 'たって', teFormKanji: '立って', meaning: 'Đứng', hanViet: 'LẬP', group: 1, endingBefore: 'ち', rule: 'g1_tte' },
  { id: 'motsu', kanji: '持ちます', hiragana: 'もちます', teForm: 'もって', teFormKanji: '持って', meaning: 'Cầm, mang', hanViet: 'TRÌ', group: 1, endingBefore: 'ち', rule: 'g1_tte' },
  { id: 'tsukuru', kanji: '作ります', hiragana: 'つくります', teForm: 'つくって', teFormKanji: '作って', meaning: 'Làm, tạo ra', hanViet: 'TÁC', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'okuru', kanji: '送ります', hiragana: 'おくります', teForm: 'おくって', teFormKanji: '送って', meaning: 'Gửi', hanViet: 'TỐNG', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'kaeru', kanji: '帰ります', hiragana: 'かえります', teForm: 'かえって', teFormKanji: '帰って', meaning: 'Về (nhà)', hanViet: 'QUY', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'hairu', kanji: '入ります', hiragana: 'はいります', teForm: 'はいって', teFormKanji: '入って', meaning: 'Vào', hanViet: 'NHẬP', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'shiru', kanji: '知ります', hiragana: 'しります', teForm: 'しって', teFormKanji: '知って', meaning: 'Biết', hanViet: 'TRI', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'kiru_cut', kanji: '切ります', hiragana: 'きります', teForm: 'きって', teFormKanji: '切って', meaning: 'Cắt', hanViet: 'THIẾT', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'hashiru', kanji: '走ります', hiragana: 'はしります', teForm: 'はしって', teFormKanji: '走って', meaning: 'Chạy', hanViet: 'TẨU', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'noru', kanji: '乗ります', hiragana: 'のります', teForm: 'のって', teFormKanji: '乗って', meaning: 'Lên (xe)', hanViet: 'THỪA', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'toru', kanji: '取ります', hiragana: 'とります', teForm: 'とって', teFormKanji: '取って', meaning: 'Lấy', hanViet: 'THỦ', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'suwaru', kanji: '座ります', hiragana: 'すわります', teForm: 'すわって', teFormKanji: '座って', meaning: 'Ngồi', hanViet: 'TỌA', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'tomaru', kanji: '止まります', hiragana: 'とまります', teForm: 'とまって', teFormKanji: '止まって', meaning: 'Dừng lại', hanViet: 'CHỈ', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'wakaru', kanji: '分かります', hiragana: 'わかります', teForm: 'わかって', teFormKanji: '分かって', meaning: 'Hiểu', hanViet: 'PHÂN', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'yaru', kanji: 'やります', hiragana: 'やります', teForm: 'やって', teFormKanji: 'やって', meaning: 'Làm', hanViet: '', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'aru', kanji: 'あります', hiragana: 'あります', teForm: 'あって', teFormKanji: 'あって', meaning: 'Có (vật)', hanViet: '', group: 1, endingBefore: 'り', rule: 'g1_tte' },
  { id: 'narau', kanji: '習います', hiragana: 'ならいます', teForm: 'ならって', teFormKanji: '習って', meaning: 'Học (từ ai)', hanViet: 'TẬP', group: 1, endingBefore: 'い', rule: 'g1_tte' },
];

// ── Nhóm 1: み、び、に → んで ──────────────────────────────────────
const GROUP1_NDE: TeFormVerb[] = [
  { id: 'yomu', kanji: '読みます', hiragana: 'よみます', teForm: 'よんで', teFormKanji: '読んで', meaning: 'Đọc', hanViet: 'ĐỘC', group: 1, endingBefore: 'み', rule: 'g1_nde' },
  { id: 'nomu', kanji: '飲みます', hiragana: 'のみます', teForm: 'のんで', teFormKanji: '飲んで', meaning: 'Uống', hanViet: 'ẨM', group: 1, endingBefore: 'み', rule: 'g1_nde' },
  { id: 'sumu', kanji: '住みます', hiragana: 'すみます', teForm: 'すんで', teFormKanji: '住んで', meaning: 'Sống, ở', hanViet: 'TRÚ', group: 1, endingBefore: 'み', rule: 'g1_nde' },
  { id: 'yasumu', kanji: '休みます', hiragana: 'やすみます', teForm: 'やすんで', teFormKanji: '休んで', meaning: 'Nghỉ ngơi', hanViet: 'HƯU', group: 1, endingBefore: 'み', rule: 'g1_nde' },
  { id: 'asobu', kanji: '遊びます', hiragana: 'あそびます', teForm: 'あそんで', teFormKanji: '遊んで', meaning: 'Chơi', hanViet: 'DU', group: 1, endingBefore: 'び', rule: 'g1_nde' },
  { id: 'yobu', kanji: '呼びます', hiragana: 'よびます', teForm: 'よんで', teFormKanji: '呼んで', meaning: 'Gọi', hanViet: 'HÔ', group: 1, endingBefore: 'び', rule: 'g1_nde' },
  { id: 'erabu', kanji: '選びます', hiragana: 'えらびます', teForm: 'えらんで', teFormKanji: '選んで', meaning: 'Chọn', hanViet: 'TUYỂN', group: 1, endingBefore: 'び', rule: 'g1_nde' },
  { id: 'shinu', kanji: '死にます', hiragana: 'しにます', teForm: 'しんで', teFormKanji: '死んで', meaning: 'Chết', hanViet: 'TỬ', group: 1, endingBefore: 'に', rule: 'g1_nde' },
  { id: 'narabu', kanji: '並びます', hiragana: 'ならびます', teForm: 'ならんで', teFormKanji: '並んで', meaning: 'Xếp hàng', hanViet: 'TỊNH', group: 1, endingBefore: 'び', rule: 'g1_nde' },
];

// ── Nhóm 1: き → いて ──────────────────────────────────────────────
const GROUP1_ITE: TeFormVerb[] = [
  { id: 'kaku', kanji: '書きます', hiragana: 'かきます', teForm: 'かいて', teFormKanji: '書いて', meaning: 'Viết', hanViet: 'THƯ', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'kiku', kanji: '聞きます', hiragana: 'ききます', teForm: 'きいて', teFormKanji: '聞いて', meaning: 'Nghe, hỏi', hanViet: 'VĂN', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'aruku', kanji: '歩きます', hiragana: 'あるきます', teForm: 'あるいて', teFormKanji: '歩いて', meaning: 'Đi bộ', hanViet: 'BỘ', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'oku', kanji: '置きます', hiragana: 'おきます', teForm: 'おいて', teFormKanji: '置いて', meaning: 'Đặt, để', hanViet: 'TRÍ', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'hiku', kanji: '引きます', hiragana: 'ひきます', teForm: 'ひいて', teFormKanji: '引いて', meaning: 'Kéo', hanViet: 'DẪN', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'hataraku', kanji: '働きます', hiragana: 'はたらきます', teForm: 'はたらいて', teFormKanji: '働いて', meaning: 'Làm việc', hanViet: 'ĐỘNG', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'saku', kanji: '咲きます', hiragana: 'さきます', teForm: 'さいて', teFormKanji: '咲いて', meaning: 'Nở (hoa)', hanViet: 'TIẾU', group: 1, endingBefore: 'き', rule: 'g1_ite' },
  { id: 'kiku_effect', kanji: '効きます', hiragana: 'ききます', teForm: 'きいて', teFormKanji: '効いて', meaning: 'Có hiệu quả', hanViet: 'HIỆU', group: 1, endingBefore: 'き', rule: 'g1_ite' },
];

// ── Nhóm 1: ぎ → いで ──────────────────────────────────────────────
const GROUP1_IDE: TeFormVerb[] = [
  { id: 'oyogu', kanji: '泳ぎます', hiragana: 'およぎます', teForm: 'およいで', teFormKanji: '泳いで', meaning: 'Bơi', hanViet: 'VỊNH', group: 1, endingBefore: 'ぎ', rule: 'g1_ide' },
  { id: 'nugu', kanji: '脱ぎます', hiragana: 'ぬぎます', teForm: 'ぬいで', teFormKanji: '脱いで', meaning: 'Cởi (áo)', hanViet: 'THOÁT', group: 1, endingBefore: 'ぎ', rule: 'g1_ide' },
  { id: 'isogu', kanji: '急ぎます', hiragana: 'いそぎます', teForm: 'いそいで', teFormKanji: '急いで', meaning: 'Vội vàng', hanViet: 'CẤP', group: 1, endingBefore: 'ぎ', rule: 'g1_ide' },
];

// ── Nhóm 1: し → して ──────────────────────────────────────────────
const GROUP1_SHITE: TeFormVerb[] = [
  { id: 'hanasu', kanji: '話します', hiragana: 'はなします', teForm: 'はなして', teFormKanji: '話して', meaning: 'Nói chuyện', hanViet: 'THOẠI', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'dasu', kanji: '出します', hiragana: 'だします', teForm: 'だして', teFormKanji: '出して', meaning: 'Đưa ra', hanViet: 'XUẤT', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'kesu', kanji: '消します', hiragana: 'けします', teForm: 'けして', teFormKanji: '消して', meaning: 'Tắt', hanViet: 'TIÊU', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'kaesu', kanji: '返します', hiragana: 'かえします', teForm: 'かえして', teFormKanji: '返して', meaning: 'Trả lại', hanViet: 'PHẢN', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'osu', kanji: '押します', hiragana: 'おします', teForm: 'おして', teFormKanji: '押して', meaning: 'Ấn, đẩy', hanViet: 'ÁP', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'watasu', kanji: '渡します', hiragana: 'わたします', teForm: 'わたして', teFormKanji: '渡して', meaning: 'Đưa cho', hanViet: 'ĐỘ', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'kasu', kanji: '貸します', hiragana: 'かします', teForm: 'かして', teFormKanji: '貸して', meaning: 'Cho mượn', hanViet: 'THẢI', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'naosu', kanji: '直します', hiragana: 'なおします', teForm: 'なおして', teFormKanji: '直して', meaning: 'Sửa', hanViet: 'TRỰC', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'nakusu', kanji: '無くします', hiragana: 'なくします', teForm: 'なくして', teFormKanji: '無くして', meaning: 'Làm mất', hanViet: 'VÔ', group: 1, endingBefore: 'し', rule: 'g1_shite' },
  { id: 'otosu', kanji: '落とします', hiragana: 'おとします', teForm: 'おとして', teFormKanji: '落として', meaning: 'Làm rơi', hanViet: 'LẠC', group: 1, endingBefore: 'し', rule: 'g1_shite' },
];

// ── Nhóm 1: Ngoại lệ ───────────────────────────────────────────────
const GROUP1_EXCEPTION: TeFormVerb[] = [
  { id: 'iku', kanji: '行きます', hiragana: 'いきます', teForm: 'いって', teFormKanji: '行って', meaning: 'Đi', hanViet: 'HÀNH', group: 1, endingBefore: 'き', rule: 'g1_exception' },
];

// ── Nhóm 2 ──────────────────────────────────────────────────────────
const GROUP2: TeFormVerb[] = [
  { id: 'taberu', kanji: '食べます', hiragana: 'たべます', teForm: 'たべて', teFormKanji: '食べて', meaning: 'Ăn', hanViet: 'THỰC', group: 2, endingBefore: 'べ', rule: 'g2' },
  { id: 'miru', kanji: '見ます', hiragana: 'みます', teForm: 'みて', teFormKanji: '見て', meaning: 'Nhìn, xem', hanViet: 'KIẾN', group: 2, endingBefore: 'み', rule: 'g2' },
  { id: 'okiru', kanji: '起きます', hiragana: 'おきます', teForm: 'おきて', teFormKanji: '起きて', meaning: 'Thức dậy', hanViet: 'KHỞI', group: 2, endingBefore: 'き', rule: 'g2' },
  { id: 'neru', kanji: '寝ます', hiragana: 'ねます', teForm: 'ねて', teFormKanji: '寝て', meaning: 'Ngủ', hanViet: 'TẨM', group: 2, endingBefore: 'ね', rule: 'g2' },
  { id: 'deru', kanji: '出ます', hiragana: 'でます', teForm: 'でて', teFormKanji: '出て', meaning: 'Ra ngoài', hanViet: 'XUẤT', group: 2, endingBefore: 'で', rule: 'g2' },
  { id: 'akeru', kanji: '開けます', hiragana: 'あけます', teForm: 'あけて', teFormKanji: '開けて', meaning: 'Mở', hanViet: 'KHAI', group: 2, endingBefore: 'け', rule: 'g2' },
  { id: 'shimeru', kanji: '閉めます', hiragana: 'しめます', teForm: 'しめて', teFormKanji: '閉めて', meaning: 'Đóng', hanViet: 'BẾ', group: 2, endingBefore: 'め', rule: 'g2' },
  { id: 'ireru', kanji: '入れます', hiragana: 'いれます', teForm: 'いれて', teFormKanji: '入れて', meaning: 'Cho vào', hanViet: 'NHẬP', group: 2, endingBefore: 'れ', rule: 'g2' },
  { id: 'oshieru', kanji: '教えます', hiragana: 'おしえます', teForm: 'おしえて', teFormKanji: '教えて', meaning: 'Dạy, chỉ bảo', hanViet: 'GIÁO', group: 2, endingBefore: 'え', rule: 'g2' },
  { id: 'kiru_wear', kanji: '着ます', hiragana: 'きます', teForm: 'きて', teFormKanji: '着て', meaning: 'Mặc (áo)', hanViet: 'TRƯỚC', group: 2, endingBefore: 'き', rule: 'g2' },
  { id: 'abiru', kanji: '浴びます', hiragana: 'あびます', teForm: 'あびて', teFormKanji: '浴びて', meaning: 'Tắm (vòi)', hanViet: 'DỤC', group: 2, endingBefore: 'び', rule: 'g2' },
  { id: 'kariru', kanji: '借ります', hiragana: 'かります', teForm: 'かりて', teFormKanji: '借りて', meaning: 'Mượn', hanViet: 'TÁ', group: 2, endingBefore: 'り', rule: 'g2' },
  { id: 'oriru', kanji: '降ります', hiragana: 'おります', teForm: 'おりて', teFormKanji: '降りて', meaning: 'Xuống (xe)', hanViet: 'GIÁNG', group: 2, endingBefore: 'り', rule: 'g2' },
  { id: 'ochiru', kanji: '落ちます', hiragana: 'おちます', teForm: 'おちて', teFormKanji: '落ちて', meaning: 'Rơi, rụng', hanViet: 'LẠC', group: 2, endingBefore: 'ち', rule: 'g2' },
  { id: 'kakeru', kanji: '掛けます', hiragana: 'かけます', teForm: 'かけて', teFormKanji: '掛けて', meaning: 'Treo, gọi điện', hanViet: 'QUẢI', group: 2, endingBefore: 'け', rule: 'g2' },
  { id: 'wasureru', kanji: '忘れます', hiragana: 'わすれます', teForm: 'わすれて', teFormKanji: '忘れて', meaning: 'Quên', hanViet: 'VONG', group: 2, endingBefore: 'れ', rule: 'g2' },
  { id: 'shiraberu', kanji: '調べます', hiragana: 'しらべます', teForm: 'しらべて', teFormKanji: '調べて', meaning: 'Tra cứu', hanViet: 'ĐIỀU', group: 2, endingBefore: 'べ', rule: 'g2' },
  { id: 'kotaeru', kanji: '答えます', hiragana: 'こたえます', teForm: 'こたえて', teFormKanji: '答えて', meaning: 'Trả lời', hanViet: 'ĐÁP', group: 2, endingBefore: 'え', rule: 'g2' },
  { id: 'kieru', kanji: '消えます', hiragana: 'きえます', teForm: 'きえて', teFormKanji: '消えて', meaning: 'Biến mất', hanViet: 'TIÊU', group: 2, endingBefore: 'え', rule: 'g2' },
  { id: 'tsukareru', kanji: '疲れます', hiragana: 'つかれます', teForm: 'つかれて', teFormKanji: '疲れて', meaning: 'Mệt', hanViet: 'BÌ', group: 2, endingBefore: 'れ', rule: 'g2' },
  { id: 'kangaeru', kanji: '考えます', hiragana: 'かんがえます', teForm: 'かんがえて', teFormKanji: '考えて', meaning: 'Suy nghĩ', hanViet: 'KHẢO', group: 2, endingBefore: 'え', rule: 'g2' },
  { id: 'umareru', kanji: '生まれます', hiragana: 'うまれます', teForm: 'うまれて', teFormKanji: '生まれて', meaning: 'Được sinh ra', hanViet: 'SINH', group: 2, endingBefore: 'れ', rule: 'g2' },
  { id: 'dekiru', kanji: '出来ます', hiragana: 'できます', teForm: 'できて', teFormKanji: '出来て', meaning: 'Có thể', hanViet: 'XUẤT LAI', group: 2, endingBefore: 'き', rule: 'g2' },
  { id: 'iru', kanji: '居ます', hiragana: 'います', teForm: 'いて', teFormKanji: 'いて', meaning: 'Ở, có (người)', hanViet: 'CƯ', group: 2, endingBefore: 'い', rule: 'g2' },
  { id: 'tsukeru', kanji: 'つけます', hiragana: 'つけます', teForm: 'つけて', teFormKanji: 'つけて', meaning: 'Bật, gắn', hanViet: '', group: 2, endingBefore: 'け', rule: 'g2' },
  { id: 'shinjiru', kanji: '信じます', hiragana: 'しんじます', teForm: 'しんじて', teFormKanji: '信じて', meaning: 'Tin tưởng', hanViet: 'TÍN', group: 2, endingBefore: 'じ', rule: 'g2' },
  { id: 'tariru', kanji: '足ります', hiragana: 'たります', teForm: 'たりて', teFormKanji: '足りて', meaning: 'Đủ', hanViet: 'TÚC', group: 2, endingBefore: 'り', rule: 'g2' },
  { id: 'tomeru', kanji: '止めます', hiragana: 'とめます', teForm: 'とめて', teFormKanji: '止めて', meaning: 'Dừng, tắt', hanViet: 'CHỈ', group: 2, endingBefore: 'め', rule: 'g2' },
  { id: 'miseru', kanji: '見せます', hiragana: 'みせます', teForm: 'みせて', teFormKanji: '見せて', meaning: 'Cho xem', hanViet: 'KIẾN', group: 2, endingBefore: 'せ', rule: 'g2' },
];

// ── Nhóm 3 (Bất quy tắc) ───────────────────────────────────────────
const GROUP3: TeFormVerb[] = [
  { id: 'suru', kanji: 'します', hiragana: 'します', teForm: 'して', teFormKanji: 'して', meaning: 'Làm', hanViet: '', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'kuru', kanji: '来ます', hiragana: 'きます', teForm: 'きて', teFormKanji: '来て', meaning: 'Đến', hanViet: 'LAI', group: 3, endingBefore: 'き', rule: 'g3_kuru' },
  { id: 'benkyou', kanji: '勉強します', hiragana: 'べんきょうします', teForm: 'べんきょうして', teFormKanji: '勉強して', meaning: 'Học', hanViet: 'MIỄN CƯỜNG', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'ryouri', kanji: '料理します', hiragana: 'りょうりします', teForm: 'りょうりして', teFormKanji: '料理して', meaning: 'Nấu ăn', hanViet: 'LIỆU LÝ', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'kekkon', kanji: '結婚します', hiragana: 'けっこんします', teForm: 'けっこんして', teFormKanji: '結婚して', meaning: 'Kết hôn', hanViet: 'KẾT HÔN', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'sanpo', kanji: '散歩します', hiragana: 'さんぽします', teForm: 'さんぽして', teFormKanji: '散歩して', meaning: 'Đi dạo', hanViet: 'TÁN BỘ', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'sentaku', kanji: '洗濯します', hiragana: 'せんたくします', teForm: 'せんたくして', teFormKanji: '洗濯して', meaning: 'Giặt đồ', hanViet: 'TẨY TRẠC', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'souji', kanji: '掃除します', hiragana: 'そうじします', teForm: 'そうじして', teFormKanji: '掃除して', meaning: 'Dọn dẹp', hanViet: 'TẢO TRỪ', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'denwa', kanji: '電話します', hiragana: 'でんわします', teForm: 'でんわして', teFormKanji: '電話して', meaning: 'Gọi điện', hanViet: 'ĐIỆN THOẠI', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'kaimono', kanji: '買い物します', hiragana: 'かいものします', teForm: 'かいものして', teFormKanji: '買い物して', meaning: 'Đi mua sắm', hanViet: 'MÃI VẬT', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'ryokou', kanji: '旅行します', hiragana: 'りょこうします', teForm: 'りょこうして', teFormKanji: '旅行して', meaning: 'Du lịch', hanViet: 'LỮ HÀNH', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'renshuu', kanji: '練習します', hiragana: 'れんしゅうします', teForm: 'れんしゅうして', teFormKanji: '練習して', meaning: 'Luyện tập', hanViet: 'LUYỆN TẬP', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'undou', kanji: '運動します', hiragana: 'うんどうします', teForm: 'うんどうして', teFormKanji: '運動して', meaning: 'Tập thể dục', hanViet: 'VẬN ĐỘNG', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'shinpai', kanji: '心配します', hiragana: 'しんぱいします', teForm: 'しんぱいして', teFormKanji: '心配して', meaning: 'Lo lắng', hanViet: 'TÂM PHỐI', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'ryuugaku', kanji: '留学します', hiragana: 'りゅうがくします', teForm: 'りゅうがくして', teFormKanji: '留学して', meaning: 'Du học', hanViet: 'LƯU HỌC', group: 3, endingBefore: 'し', rule: 'g3_suru' },
  { id: 'shoukai', kanji: '紹介します', hiragana: 'しょうかいします', teForm: 'しょうかいして', teFormKanji: '紹介して', meaning: 'Giới thiệu', hanViet: 'THIỆU GIỚI', group: 3, endingBefore: 'し', rule: 'g3_suru' },
];

// ── Export toàn bộ danh sách ─────────────────────────────────────────
export const TE_FORM_VERBS: TeFormVerb[] = [
  ...GROUP1_TTE,
  ...GROUP1_NDE,
  ...GROUP1_ITE,
  ...GROUP1_IDE,
  ...GROUP1_SHITE,
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

// ── Nhóm mô tả (dùng cho giải thích khi sai) ───────────────────────
export const GROUP_DESCRIPTIONS: Record<number, string> = {
  1: 'Nhóm 1 (五段動詞 - Godan): Âm trước「ます」thuộc cột「い」(い段). Có nhiều quy tắc chia tùy theo âm cuối.',
  2: 'Nhóm 2 (一段動詞 - Ichidan): Âm trước「ます」thường thuộc cột「え」(え段). Quy tắc: Bỏ「ます」+ て.',
  3: 'Nhóm 3 (不規則動詞 - Bất quy tắc): Gồm「します」và「来ます」. Cần ghi nhớ.',
};

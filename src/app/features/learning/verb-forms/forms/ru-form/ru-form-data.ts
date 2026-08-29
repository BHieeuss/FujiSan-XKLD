/**
 * Ru-form / Jishokei (thể Từ Điển / Thể る - 辞書形) verb conjugation data for N5-N4 level.
 * Each verb includes full metadata for practice exercises, grammar examples, and explanations.
 */

export interface RuFormVerb {
  id: string;
  kanji: string;        // Dạng ます có Kanji: 買います
  hiragana: string;     // Dạng ます Hiragana: かいます
  ruForm: string;       // Thể Từ Điển Hiragana: かう
  ruFormKanji: string;  // Thể Từ Điển có Kanji: 買う
  meaning: string;      // Nghĩa tiếng Việt
  hanViet: string;      // Âm Hán Việt
  group: 1 | 2 | 3;    // Nhóm động từ (1, 2, hoặc 3)
  endingBefore: string; // Ký tự trước ます
  rule: string;         // Quy tắc chia cụ thể
  exampleSentence?: string; // Mẫu câu ứng dụng thể từ điển
  exampleMeaning?: string;  // Nghĩa mẫu câu
}

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

// ── Quy tắc chia theo nhóm ────────────────────────────────────────
export const RU_FORM_RULES: Record<string, string> = {
  // Nhóm 1
  'g1_i_u': 'Nhóm 1: Kết thúc い → Đổi thành う',
  'g1_ki_ku': 'Nhóm 1: Kết thúc き → Đổi thành く',
  'g1_gi_gu': 'Nhóm 1: Kết thúc ぎ → Đổi thành ぐ',
  'g1_shi_su': 'Nhóm 1: Kết thúc し → Đổi thành す',
  'g1_chi_tsu': 'Nhóm 1: Kết thúc ち → Đổi thành つ',
  'g1_ni_nu': 'Nhóm 1: Kết thúc に → Đổi thành ぬ',
  'g1_bi_bu': 'Nhóm 1: Kết thúc び → Đổi thành ぶ',
  'g1_mi_mu': 'Nhóm 1: Kết thúc み → Đổi thành む',
  'g1_ri_ru': 'Nhóm 1: Kết thúc り → Đổi thành る',
  // Nhóm 2
  'g2': 'Nhóm 2: Bỏ ます + る',
  // Nhóm 3
  'g3_suru': 'Nhóm 3: します → する (bất quy tắc)',
  'g3_kuru': 'Nhóm 3: 来ます (きます) → 来る (くる) (⚠️ Đổi âm Ki thành Ku)',
};

// ── Nhóm 1: Cột い chuyển sang cột う ───────────────────────────────
const GROUP1_RU: RuFormVerb[] = [
  // 1. い → う
  { id: 'kau', kanji: '買います', hiragana: 'かいます', ruForm: 'かう', ruFormKanji: '買う', meaning: 'Mua', hanViet: 'MÃI', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: 'スーパーで パンを 買う ことが できます。', exampleMeaning: 'Có thể mua bánh mì ở siêu thị.' },
  { id: 'au', kanji: '会います', hiragana: 'あいます', ruForm: 'あう', ruFormKanji: '会う', meaning: 'Gặp', hanViet: 'HỘI', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: '友達に 会う 約束が あります。', exampleMeaning: 'Tôi có hẹn gặp bạn bè.' },
  { id: 'iu', kanji: '言います', hiragana: 'いいます', ruForm: 'いう', ruFormKanji: '言う', meaning: 'Nói', hanViet: 'NGÔN', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: '本当の ことを 言う ほうがいいです。', exampleMeaning: 'Nên nói ra sự thật.' },
  { id: 'tsukau', kanji: '使います', hiragana: 'つかいます', ruForm: 'つかう', ruFormKanji: '使う', meaning: 'Sử dụng', hanViet: 'SỬ', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: '箸を 使う ことが できますか。', exampleMeaning: 'Bạn có thể dùng đũa được không?' },
  { id: 'suu', kanji: '吸います', hiragana: 'すいます', ruForm: 'すう', ruFormKanji: '吸う', meaning: 'Hút', hanViet: 'HẤP', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: '息を 深く 吸う。', exampleMeaning: 'Hít một hơi thật sâu.' },
  { id: 'arau', kanji: '洗います', hiragana: 'あらいます', ruForm: 'あらう', ruFormKanji: '洗う', meaning: 'Rửa', hanViet: 'TẨY', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: 'ごはんを 食べる 前に 手を 洗う。', exampleMeaning: 'Rửa tay trước khi ăn cơm.' },
  { id: 'harau', kanji: '払います', hiragana: 'はらいます', ruForm: 'はらう', ruFormKanji: '払う', meaning: 'Trả tiền', hanViet: 'PHẤT', group: 1, endingBefore: 'い', rule: 'g1_i_u', exampleSentence: 'カードで 払う ことが できます。', exampleMeaning: 'Có thể thanh toán bằng thẻ.' },

  // 2. き → く
  { id: 'kaku', kanji: '書きます', hiragana: 'かきます', ruForm: 'かく', ruFormKanji: '書く', meaning: 'Viết', hanViet: 'THƯ', group: 1, endingBefore: 'き', rule: 'g1_ki_ku', exampleSentence: '漢字を 書く ことが できます。', exampleMeaning: 'Tôi có thể viết chữ Hán.' },
  { id: 'kiku', kanji: '聞きます', hiragana: 'ききます', ruForm: 'きく', ruFormKanji: '聞く', meaning: 'Nghe, hỏi', hanViet: 'VĂN', group: 1, endingBefore: 'き', rule: 'g1_ki_ku', exampleSentence: '趣味は 音楽を 聴く ことです。', exampleMeaning: 'Sở thích của tôi là nghe nhạc.' },
  { id: 'aruku', kanji: '歩きます', hiragana: 'あるきます', ruForm: 'あるく', ruFormKanji: '歩く', meaning: 'Đi bộ', hanViet: 'BỘ', group: 1, endingBefore: 'き', rule: 'g1_ki_ku', exampleSentence: '毎日 30分 歩く ようにしています。', exampleMeaning: 'Tôi cố gắng đi bộ 30 phút mỗi ngày.' },
  { id: 'iku', kanji: '行きます', hiragana: 'いきます', ruForm: 'いく', ruFormKanji: '行く', meaning: 'Đi', hanViet: 'HÀNH', group: 1, endingBefore: 'き', rule: 'g1_ki_ku', exampleSentence: '来年 日本へ 行く つもりです。', exampleMeaning: 'Tôi dự định sang năm sẽ đi Nhật.' },
  { id: 'hataraku', kanji: '働きます', hiragana: 'はたらきます', ruForm: 'はたらく', ruFormKanji: '働く', meaning: 'Làm việc', hanViet: 'ĐỘNG', group: 1, endingBefore: 'き', rule: 'g1_ki_ku', exampleSentence: '工場で 働く ことが できます。', exampleMeaning: 'Có thể làm việc tại nhà máy.' },

  // 3. ぎ → ぐ
  { id: 'oyogu', kanji: '泳ぎます', hiragana: 'およぎます', ruForm: 'およぐ', ruFormKanji: '泳ぐ', meaning: 'Bơi', hanViet: 'VỊNH', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_gu', exampleSentence: 'わたしは 50メートル 泳ぐ ことが できます。', exampleMeaning: 'Tôi có thể bơi được 50 mét.' },
  { id: 'isogu', kanji: '急ぎます', hiragana: 'いそぎます', ruForm: 'いそぐ', ruFormKanji: '急ぐ', meaning: 'Vội vàng', hanViet: 'CẤP', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_gu', exampleSentence: '時間が ないから 急ぐ。', exampleMeaning: 'Vì không có thời gian nên vội.' },
  { id: 'nugu', kanji: '脱ぎます', hiragana: 'ぬぎます', ruForm: 'ぬぐ', ruFormKanji: '脱ぐ', meaning: 'Cởi', hanViet: 'THOÁT', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_gu', exampleSentence: '靴を 脱ぐ 前に 声を かけてください。', exampleMeaning: 'Trước khi cởi giày hãy gọi tôi nhé.' },

  // 4. し → す
  { id: 'hanasu', kanji: '話します', hiragana: 'はなします', ruForm: 'はなす', ruFormKanji: '話す', meaning: 'Nói chuyện', hanViet: 'THOẠI', group: 1, endingBefore: 'し', rule: 'g1_shi_su', exampleSentence: '日本語を 話す ことが できます。', exampleMeaning: 'Tôi có thể nói tiếng Nhật.' },
  { id: 'dasu', kanji: '出します', hiragana: 'だします', ruForm: 'だす', ruFormKanji: '出す', meaning: 'Đưa ra, nộp', hanViet: 'XUẤT', group: 1, endingBefore: 'し', rule: 'g1_shi_su', exampleSentence: 'レポートを 出す まえに 見直す。', exampleMeaning: 'Kiểm tra lại trước khi nộp báo cáo.' },
  { id: 'kesu', kanji: '消します', hiragana: 'けします', ruForm: 'けす', ruFormKanji: '消す', meaning: 'Tắt (điện)', hanViet: 'TIÊU', group: 1, endingBefore: 'し', rule: 'g1_shi_su', exampleSentence: '寝る 前に 電気を 消す。', exampleMeaning: 'Tắt điện trước khi đi ngủ.' },
  { id: 'kaesu', kanji: '返します', hiragana: 'かえします', ruForm: 'かえす', ruFormKanji: '返す', meaning: 'Trả lại', hanViet: 'PHẢN', group: 1, endingBefore: 'し', rule: 'g1_shi_su', exampleSentence: '本を 返す 約束を しました。', exampleMeaning: 'Tôi đã hứa trả lại sách.' },
  { id: 'kasu', kanji: '貸します', hiragana: 'かします', ruForm: 'かす', ruFormKanji: '貸す', meaning: 'Cho mượn', hanViet: 'THẢI', group: 1, endingBefore: 'し', rule: 'g1_shi_su', exampleSentence: '友達に 傘を 貸す。', exampleMeaning: 'Cho bạn mượn ô.' },

  // 5. ち → つ
  { id: 'matsu', kanji: '待ちます', hiragana: 'まちます', ruForm: 'まつ', ruFormKanji: '待つ', meaning: 'Đợi', hanViet: 'ĐÃI', group: 1, endingBefore: 'ち', rule: 'g1_chi_tsu', exampleSentence: 'バスを 待つ 間 本を 読む。', exampleMeaning: 'Đọc sách trong lúc đợi xe buýt.' },
  { id: 'tatsu', kanji: '立ちます', hiragana: 'たちます', ruForm: 'たつ', ruFormKanji: '立つ', meaning: 'Đứng', hanViet: 'LẬP', group: 1, endingBefore: 'ち', rule: 'g1_chi_tsu', exampleSentence: '席を 立つ。', exampleMeaning: 'Rời khỏi chỗ ngồi.' },
  { id: 'motsu', kanji: '持ちます', hiragana: 'もちます', ruForm: 'もつ', ruFormKanji: '持つ', meaning: 'Cầm, mang', hanViet: 'TRÌ', group: 1, endingBefore: 'ち', rule: 'g1_chi_tsu', exampleSentence: '荷物を 持つ ことが できます。', exampleMeaning: 'Có thể xách hành lý.' },

  // 6. に → ぬ
  { id: 'shinu', kanji: '死にます', hiragana: 'しにます', ruForm: 'しぬ', ruFormKanji: '死ぬ', meaning: 'Chết', hanViet: 'TỬ', group: 1, endingBefore: 'に', rule: 'g1_ni_nu', exampleSentence: '人間は いつか 死ぬ。', exampleMeaning: 'Con người ai rồi cũng sẽ mất đi.' },

  // 7. び → ぶ
  { id: 'asobu', kanji: '遊びます', hiragana: 'あそびます', ruForm: 'あそぶ', ruFormKanji: '遊ぶ', meaning: 'Chơi', hanViet: 'DU', group: 1, endingBefore: 'び', rule: 'g1_bi_bu', exampleSentence: '趣味は ゲームで 遊ぶ ことです。', exampleMeaning: 'Sở thích của tôi là chơi trò chơi điện tử.' },
  { id: 'yobu', kanji: '呼びます', hiragana: 'よびます', ruForm: 'よぶ', ruFormKanji: '呼ぶ', meaning: 'Gọi', hanViet: 'HÔ', group: 1, endingBefore: 'び', rule: 'g1_bi_bu', exampleSentence: 'タクシーを 呼ぶ ことが できます。', exampleMeaning: 'Có thể gọi taxi.' },
  { id: 'erabu', kanji: '選びます', hiragana: 'えらびます', ruForm: 'えらぶ', ruFormKanji: '選ぶ', meaning: 'Chọn', hanViet: 'TUYỂN', group: 1, endingBefore: 'び', rule: 'g1_bi_bu', exampleSentence: '好きな 物を 選ぶ。', exampleMeaning: 'Chọn món đồ mình yêu thích.' },

  // 8. み → む
  { id: 'nomu', kanji: '飲みます', hiragana: 'のみます', ruForm: 'のむ', ruFormKanji: '飲む', meaning: 'Uống', hanViet: 'ẨM', group: 1, endingBefore: 'み', rule: 'g1_mi_mu', exampleSentence: '薬を 飲む 前に ごはんを 食べます。', exampleMeaning: 'Ăn cơm trước khi uống thuốc.' },
  { id: 'yomu', kanji: '読みます', hiragana: 'よみます', ruForm: 'よむ', ruFormKanji: '読む', meaning: 'Đọc', hanViet: 'ĐỘC', group: 1, endingBefore: 'み', rule: 'g1_mi_mu', exampleSentence: '趣味は 本を 読む ことです。', exampleMeaning: 'Sở thích của tôi là đọc sách.' },
  { id: 'sumu', kanji: '住みます', hiragana: 'すみます', ruForm: 'すむ', ruFormKanji: '住む', meaning: 'Sống', hanViet: 'TRÚ', group: 1, endingBefore: 'み', rule: 'g1_mi_mu', exampleSentence: '日本に 住む つもりです。', exampleMeaning: 'Tôi dự định sống ở Nhật Bản.' },
  { id: 'yasumu', kanji: '休みます', hiragana: 'やすみます', ruForm: 'やすむ', ruFormKanji: '休む', meaning: 'Nghỉ ngơi', hanViet: 'HƯU', group: 1, endingBefore: 'み', rule: 'g1_mi_mu', exampleSentence: '少し 休む ほうがいいです。', exampleMeaning: 'Nên nghỉ ngơi một chút.' },

  // 9. り → る
  { id: 'kaeru', kanji: '帰ります', hiragana: 'かえります', ruForm: 'かえる', ruFormKanji: '帰る', meaning: 'Về', hanViet: 'QUY', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: '国へ 帰る 前に お土産を 買います。', exampleMeaning: 'Trước khi về nước tôi sẽ mua quà lưu niệm.' },
  { id: 'tsukuru', kanji: '作ります', hiragana: 'つくります', ruForm: 'つくる', ruFormKanji: '作る', meaning: 'Làm, tạo', hanViet: 'TÁC', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: '日本料理を 作る ことが できます。', exampleMeaning: 'Tôi có thể nấu món ăn Nhật.' },
  { id: 'toru', kanji: '取ります', hiragana: 'とります', ruForm: 'とる', ruFormKanji: '取る', meaning: 'Lấy, chụp', hanViet: 'THỦ', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: 'いい 写真を 撮る ことが できた。', exampleMeaning: 'Đã chụp được bức ảnh đẹp.' },
  { id: 'hairu', kanji: '入ります', hiragana: 'はいります', ruForm: 'はいる', ruFormKanji: '入る', meaning: 'Vào', hanViet: 'NHẬP', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: 'お風呂に 入る。', exampleMeaning: 'Tắm bồn.' },
  { id: 'shiru', kanji: '知ります', hiragana: 'しります', ruForm: 'しる', ruFormKanji: '知る', meaning: 'Biết', hanViet: 'TRI', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: '真実を 知る ことが できた。', exampleMeaning: 'Đã biết được sự thật.' },
  { id: 'kiru_cut', kanji: '切ります', hiragana: 'きります', ruForm: 'きる', ruFormKanji: '切る', meaning: 'Cắt', hanViet: 'THIẾT', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: 'ハサミで 紙を 切る。', exampleMeaning: 'Cắt giấy bằng kéo.' },
  { id: 'wakaru', kanji: '分かります', hiragana: 'わかります', ruForm: 'わかる', ruFormKanji: '分かる', meaning: 'Hiểu', hanViet: 'PHÂN', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: '意味が よく 分かる。', exampleMeaning: 'Hiểu rất rõ ý nghĩa.' },
  { id: 'aru', kanji: 'あります', hiragana: 'あります', ruForm: 'ある', ruFormKanji: 'ある', meaning: 'Có (vật)', hanViet: '', group: 1, endingBefore: 'り', rule: 'g1_ri_ru', exampleSentence: '駅の 近くに コンビニが ある。', exampleMeaning: 'Có cửa hàng tiện lợi ở gần ga.' },
];

// ── Nhóm 2: Bỏ ます + る ───────────────────────────────────────────
const GROUP2_RU: RuFormVerb[] = [
  { id: 'taberu', kanji: '食べます', hiragana: 'たべます', ruForm: 'たべる', ruFormKanji: '食べる', meaning: 'Ăn', hanViet: 'THỰC', group: 2, endingBefore: 'べ', rule: 'g2', exampleSentence: '納豆を 食べる ことが できますか。', exampleMeaning: 'Bạn có thể ăn món Natto được không?' },
  { id: 'miru', kanji: '見ます', hiragana: 'みます', ruForm: 'みる', ruFormKanji: '見る', meaning: 'Nhìn, xem', hanViet: 'KIẾN', group: 2, endingBefore: 'み', rule: 'g2', exampleSentence: '趣味は 映画を 見る ことです。', exampleMeaning: 'Sở thích của tôi là xem phim.' },
  { id: 'okiru', kanji: '起きます', hiragana: 'おきます', ruForm: 'おきる', ruFormKanji: '起きる', meaning: 'Thức dậy', hanViet: 'KHỞI', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '毎朝 6時に 起きる ようにしています。', exampleMeaning: 'Tôi cố gắng thức dậy lúc 6 giờ mỗi sáng.' },
  { id: 'neru', kanji: '寝ます', hiragana: 'ねます', ruForm: 'ねる', ruFormKanji: '寝る', meaning: 'Ngủ', hanViet: 'TẨM', group: 2, endingBefore: 'ね', rule: 'g2', exampleSentence: '寝る 前に 日記を 書く。', exampleMeaning: 'Viết nhật ký trước khi đi ngủ.' },
  { id: 'wasureru', kanji: '忘れます', hiragana: 'わすれます', ruForm: 'わすれる', ruFormKanji: '忘れる', meaning: 'Quên', hanViet: 'VONG', group: 2, endingBefore: 'れ', rule: 'g2', exampleSentence: '傘を 忘れる ことが 多いです。', exampleMeaning: 'Tôi hay bị quên ô.' },
  { id: 'shimeru', kanji: '閉めます', hiragana: 'しめます', ruForm: 'しめる', ruFormKanji: '閉める', meaning: 'Đóng', hanViet: 'BẾ', group: 2, endingBefore: 'め', rule: 'g2', exampleSentence: 'ドアを 閉める。', exampleMeaning: 'Đóng cửa lại.' },
  { id: 'akeru', kanji: '開けます', hiragana: 'あけます', ruForm: 'あける', ruFormKanji: '開ける', meaning: 'Mở', hanViet: 'KHAI', group: 2, endingBefore: 'け', rule: 'g2', exampleSentence: '窓を 開ける。', exampleMeaning: 'Mở cửa sổ.' },
  { id: 'oshieru', kanji: '教えます', hiragana: 'おしえます', ruForm: 'おしえる', ruFormKanji: '教える', meaning: 'Dạy, chỉ bảo', hanViet: 'GIÁO', group: 2, endingBefore: 'え', rule: 'g2', exampleSentence: 'ベトナム語を 教える ことが できます。', exampleMeaning: 'Tôi có thể dạy tiếng Việt.' },
  { id: 'kariru', kanji: '借ります', hiragana: 'かります', ruForm: 'かりる', ruFormKanji: '借りる', meaning: 'Mượn', hanViet: 'TÁ', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: '本を 借りる ことが できます。', exampleMeaning: 'Có thể mượn sách.' },
  { id: 'oriru', kanji: '降ります', hiragana: 'おります', ruForm: 'おりる', ruFormKanji: '降りる', meaning: 'Xuống (xe)', hanViet: 'GIÁNG', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: '次の バス停で 降りる。', exampleMeaning: 'Xuống ở điểm xe buýt kế tiếp.' },
  { id: 'dekiru', kanji: '出来ます', hiragana: 'できます', ruForm: 'できる', ruFormKanji: '出来る', meaning: 'Có thể', hanViet: 'XUẤT LAI', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '運転が できる。', exampleMeaning: 'Có thể lái xe.' },
];

// ── Nhóm 3: Bất quy tắc ─────────────────────────────────────────────
const GROUP3_RU: RuFormVerb[] = [
  { id: 'suru', kanji: 'します', hiragana: 'します', ruForm: 'する', ruFormKanji: 'する', meaning: 'Làm', hanViet: '', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'テニスを する ことが できます。', exampleMeaning: 'Tôi có thể chơi quần vợt.' },
  { id: 'kuru', kanji: '来ます', hiragana: 'きます', ruForm: 'くる', ruFormKanji: '来る', meaning: 'Đến', hanViet: 'LAI', group: 3, endingBefore: 'き', rule: 'g3_kuru', exampleSentence: '明日 うちへ 来る 約束です。', exampleMeaning: 'Hẹn ngày mai sẽ đến nhà tôi.' },
  { id: 'benkyou', kanji: '勉強します', hiragana: 'べんきょうします', ruForm: 'べんきょうする', ruFormKanji: '勉強する', meaning: 'Học', hanViet: 'MIỄN CƯỜNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '日本で 勉強する つもりです。', exampleMeaning: 'Tôi dự định học tập tại Nhật Bản.' },
  { id: 'ryouri', kanji: '料理します', hiragana: 'りょうりします', ruForm: 'りょうりする', ruFormKanji: '料理する', meaning: 'Nấu ăn', hanViet: 'LIỆU LÝ', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '趣味は 料理する ことです。', exampleMeaning: 'Sở thích của tôi là nấu ăn.' },
  { id: 'ryokou', kanji: '旅行します', hiragana: 'りょこうします', ruForm: 'りょこうする', ruFormKanji: '旅行する', meaning: 'Du lịch', hanViet: 'LỮ HÀNH', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '夏休みに 旅行する つもりです。', exampleMeaning: 'Nghỉ hè tôi dự định đi du lịch.' },
  { id: 'undou', kanji: '運動します', hiragana: 'うんどうします', ruForm: 'うんどうする', ruFormKanji: '運動する', meaning: 'Vận động', hanViet: 'VẬN ĐỘNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '毎朝 運動する ようにしています。', exampleMeaning: 'Tôi cố gắng tập thể dục mỗi sáng.' },
];

// ── Export toàn bộ danh sách ─────────────────────────────────────────
export const RU_FORM_VERBS: RuFormVerb[] = [
  ...GROUP1_RU,
  ...GROUP2_RU,
  ...GROUP3_RU,
];

// ── Nhóm mô tả ───────────────────────────────────────────────────────
export const RU_GROUP_DESCRIPTIONS: Record<number, string> = {
  1: 'Nhóm 1 (五段動詞 - Godan): Chuyển âm trước「ます」từ cột「い」(い段) sang cột「う」(う段) và bỏ「ます」.',
  2: 'Nhóm 2 (一段動詞 - Ichidan): Bỏ「ます」+「る」.',
  3: 'Nhóm 3 (不規則動詞 - Bất quy tắc):「します」→「する」và「来ます (きます)」→「来る (くる)」.',
};

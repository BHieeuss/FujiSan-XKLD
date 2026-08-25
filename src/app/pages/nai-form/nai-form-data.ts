/**
 * Nai-form (thể ない - Phủ định) verb conjugation data for N5-N4 level.
 * Each verb includes full metadata for practice exercises, grammar examples, and explanations.
 */

export interface NaiFormVerb {
  id: string;
  kanji: string;         // Dạng ます có Kanji: 買います
  hiragana: string;      // Dạng ます Hiragana: かいます
  naiForm: string;       // Thể ない Hiragana: かわない
  naiFormKanji: string;   // Thể ない có Kanji: 買わない
  meaning: string;       // Nghĩa tiếng Việt
  hanViet?: string;      // Âm Hán Việt
  group: 1 | 2 | 3;     // Nhóm động từ (1, 2, hoặc 3)
  endingBefore: string;  // Ký tự trước ます
  rule: string;          // Quy tắc chia cụ thể
  exampleSentence?: string; // Mẫu câu ứng dụng thể ない
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
export const NAI_FORM_RULES: Record<string, string> = {
  // Nhóm 1
  'g1_i_wa': 'Nhóm 1: Kết thúc い → Đổi thành わ + ない (⚠️ Không phải あ)',
  'g1_ki_ka': 'Nhóm 1: Kết thúc き → Đổi thành か + ない',
  'g1_gi_ga': 'Nhóm 1: Kết thúc ぎ → Đổi thành が + ない',
  'g1_shi_sa': 'Nhóm 1: Kết thúc し → Đổi thành さ + ない',
  'g1_chi_ta': 'Nhóm 1: Kết thúc ち → Đổi thành た + ない',
  'g1_ni_na': 'Nhóm 1: Kết thúc に → Đổi thành な + ない',
  'g1_bi_ba': 'Nhóm 1: Kết thúc び → Đổi thành ば + ない',
  'g1_mi_ma': 'Nhóm 1: Kết thúc み → Đổi thành ま + ない',
  'g1_ri_ra': 'Nhóm 1: Kết thúc り → Đổi thành ら + ない',
  'g1_exception_aru': 'Nhóm 1 (Ngoại lệ): あります → ない (không chia thành あらない)',
  // Nhóm 2
  'g2': 'Nhóm 2: Bỏ ます + ない',
  // Nhóm 3
  'g3_suru': 'Nhóm 3: します → しない (bất quy tắc)',
  'g3_kuru': 'Nhóm 3: 来ます (きます) → 来ない (こない) (⚠️ Đổi âm Ki thành Ko)',
};

// ── Nhóm 1: Cột い chuyển sang cột あ + ない ────────────────────────
const GROUP1_NAI: NaiFormVerb[] = [
  // 1. い → わ + ない (⚠️ CỰC KỲ QUAN TRỌNG)
  { id: 'kau', kanji: '買います', hiragana: 'かいます', naiForm: 'かわない', naiFormKanji: '買わない', meaning: 'Mua', hanViet: 'MÃI', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: '高い 物は 買わないで ください。', exampleMeaning: 'Xin đừng mua những đồ đắt tiền.' },
  { id: 'au', kanji: '会います', hiragana: 'あいます', naiForm: 'あわない', naiFormKanji: '会わない', meaning: 'Gặp', hanViet: 'HỘI', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: '今日は 誰にも 会わない。', exampleMeaning: 'Hôm nay tôi không gặp ai cả.' },
  { id: 'iu', kanji: '言います', hiragana: 'いいます', naiForm: 'いわない', naiFormKanji: '言わない', meaning: 'Nói', hanViet: 'NGÔN', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: '秘密だから 誰にも 言わないで ください。', exampleMeaning: 'Vì là bí mật nên xin đừng nói với ai nhé.' },
  { id: 'tsukau', kanji: '使います', hiragana: 'つかいます', naiForm: 'つかわない', naiFormKanji: '使わない', meaning: 'Sử dụng', hanViet: 'SỬ', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: 'スマホを 使わないで ください。', exampleMeaning: 'Xin vui lòng không sử dụng điện thoại.' },
  { id: 'suu', kanji: '吸います', hiragana: 'すいます', naiForm: 'すわない', naiFormKanji: '吸わない', meaning: 'Hút (thuốc)', hanViet: 'HẤP', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: 'ここで たばこを 吸わないで ください。', exampleMeaning: 'Xin đừng hút thuốc ở đây.' },
  { id: 'arau', kanji: '洗います', hiragana: 'あらいます', naiForm: 'あらわない', naiFormKanji: '洗わない', meaning: 'Rửa', hanViet: 'TẨY', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: '手を 洗わなければ なりません。', exampleMeaning: 'Phải rửa tay.' },
  { id: 'harau', kanji: '払います', hiragana: 'はらいます', naiForm: 'はらわない', naiFormKanji: '払わない', meaning: 'Trả tiền', hanViet: 'PHẤT', group: 1, endingBefore: 'い', rule: 'g1_i_wa', exampleSentence: 'お金を 払わなくても いいです。', exampleMeaning: 'Không cần trả tiền cũng được.' },

  // 2. き → か + ない
  { id: 'kaku', kanji: '書きます', hiragana: 'かきます', naiForm: 'かかない', naiFormKanji: '書かない', meaning: 'Viết', hanViet: 'THƯ', group: 1, endingBefore: 'き', rule: 'g1_ki_ka', exampleSentence: 'ボールペンで 書かないで ください。', exampleMeaning: 'Xin đừng viết bằng bút bi.' },
  { id: 'kiku', kanji: '聞きます', hiragana: 'ききます', naiForm: 'きかない', naiFormKanji: '聞かない', meaning: 'Nghe, hỏi', hanViet: 'VĂN', group: 1, endingBefore: 'き', rule: 'g1_ki_ka', exampleSentence: '音楽を 聞きながら 勉強しない。', exampleMeaning: 'Không vừa nghe nhạc vừa học.' },
  { id: 'aruku', kanji: '歩きます', hiragana: 'あるきます', naiForm: 'あるかない', naiFormKanji: '歩かない', meaning: 'Đi bộ', hanViet: 'BỘ', group: 1, endingBefore: 'き', rule: 'g1_ki_ka', exampleSentence: '歩かないで タクシーに 乗った。', exampleMeaning: 'Không đi bộ mà đã bắt taxi.' },
  { id: 'hataraku', kanji: '働きます', hiragana: 'はたらきます', naiForm: 'はたらかない', naiFormKanji: '働かない', meaning: 'Làm việc', hanViet: 'ĐỘNG', group: 1, endingBefore: 'き', rule: 'g1_ki_ka', exampleSentence: '日曜日は 働かなくても いいです。', exampleMeaning: 'Chủ nhật không cần làm việc cũng được.' },
  { id: 'iku', kanji: '行きます', hiragana: 'いきます', naiForm: 'いかない', naiFormKanji: '行かない', meaning: 'Đi', hanViet: 'HÀNH', group: 1, endingBefore: 'き', rule: 'g1_ki_ka', exampleSentence: '病院へ 行かなければ なりません。', exampleMeaning: 'Tôi phải đi đến bệnh viện.' },

  // 3. ぎ → が + ない
  { id: 'oyogu', kanji: '泳ぎます', hiragana: 'およぎます', naiForm: 'およがない', naiFormKanji: '泳がない', meaning: 'Bơi', hanViet: 'VỊNH', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_ga', exampleSentence: 'この 川で 泳がないで ください。', exampleMeaning: 'Xin đừng bơi ở con sông này.' },
  { id: 'isogu', kanji: '急ぎます', hiragana: 'いそぎます', naiForm: 'いそがない', naiFormKanji: '急がない', meaning: 'Vội vàng', hanViet: 'CẤP', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_ga', exampleSentence: '急がなくても 間に合います。', exampleMeaning: 'Không cần vội cũng kịp giờ.' },
  { id: 'nugu', kanji: '脱ぎます', hiragana: 'ぬぎます', naiForm: 'ぬがない', naiFormKanji: '脱がない', meaning: 'Cởi', hanViet: 'THOÁT', group: 1, endingBefore: 'ぎ', rule: 'g1_gi_ga', exampleSentence: '靴を 脱がないで 入ってください。', exampleMeaning: 'Xin hãy vào mà không cần cởi giày.' },

  // 4. し → さ + ない
  { id: 'hanasu', kanji: '話します', hiragana: 'はなします', naiForm: 'はなさない', naiFormKanji: '話さない', meaning: 'Nói chuyện', hanViet: 'THOẠI', group: 1, endingBefore: 'し', rule: 'g1_shi_sa', exampleSentence: 'テスト中 話さないで ください。', exampleMeaning: 'Trong giờ kiểm tra xin đừng nói chuyện.' },
  { id: 'dasu', kanji: '出します', hiragana: 'だします', naiForm: 'ださない', naiFormKanji: '出さない', meaning: 'Đưa ra, nộp', hanViet: 'XUẤT', group: 1, endingBefore: 'し', rule: 'g1_shi_sa', exampleSentence: 'ゴミを 出さなければ なりません。', exampleMeaning: 'Phải đổ rác.' },
  { id: 'kesu', kanji: '消します', hiragana: 'けします', naiForm: 'けさない', naiFormKanji: '消さない', meaning: 'Tắt', hanViet: 'TIÊU', group: 1, endingBefore: 'し', rule: 'g1_shi_sa', exampleSentence: '電気を 消さないで 寝てしまった。', exampleMeaning: 'Tôi đã lỡ ngủ quên mà không tắt điện.' },
  { id: 'kaesu', kanji: '返します', hiragana: 'かえします', naiForm: 'かえさない', naiFormKanji: '返さない', meaning: 'Trả lại', hanViet: 'PHẢN', group: 1, endingBefore: 'し', rule: 'g1_shi_sa', exampleSentence: '本を 返さなければ なりません。', exampleMeaning: 'Phải trả sách.' },

  // 5. ち → た + ない
  { id: 'matsu', kanji: '待ちます', hiragana: 'まちます', naiForm: 'またない', naiFormKanji: '待たない', meaning: 'Đợi', hanViet: 'ĐÃI', group: 1, endingBefore: 'ち', rule: 'g1_chi_ta', exampleSentence: '待たないで 先に 行ってください。', exampleMeaning: 'Xin đừng đợi, hãy đi trước đi ạ.' },
  { id: 'tatsu', kanji: '立ちます', hiragana: 'たちます', naiForm: 'たたない', naiFormKanji: '立たない', meaning: 'Đứng', hanViet: 'LẬP', group: 1, endingBefore: 'ち', rule: 'g1_chi_ta', exampleSentence: 'ここに 立たないで ください。', exampleMeaning: 'Xin đừng đứng ở đây.' },
  { id: 'motsu', kanji: '持ちます', hiragana: 'もちます', naiForm: 'もたない', naiFormKanji: '持たない', meaning: 'Mang, cầm', hanViet: 'TRÌ', group: 1, endingBefore: 'ち', rule: 'g1_chi_ta', exampleSentence: 'パスポートを 持たないと 入れません。', exampleMeaning: 'Nếu không mang hộ chiếu thì không vào được.' },

  // 6. に → な + ない
  { id: 'shinu', kanji: '死にます', hiragana: 'しにます', naiForm: 'しなない', naiFormKanji: '死なない', meaning: 'Chết', hanViet: 'TỬ', group: 1, endingBefore: 'に', rule: 'g1_ni_na', exampleSentence: '花が 死なないように 水を あげます。', exampleMeaning: 'Tưới nước để hoa không bị chết.' },

  // 7. び → ば + ない
  { id: 'asobu', kanji: '遊びます', hiragana: 'あそびます', naiForm: 'あそばない', naiFormKanji: '遊ばない', meaning: 'Chơi', hanViet: 'DU', group: 1, endingBefore: 'び', rule: 'g1_bi_ba', exampleSentence: '道で 遊ばないで ください。', exampleMeaning: 'Xin đừng chơi ở lòng đường.' },
  { id: 'yobu', kanji: '呼びます', hiragana: 'よびます', naiForm: 'よばない', naiFormKanji: '呼ばない', meaning: 'Gọi', hanViet: 'HÔ', group: 1, endingBefore: 'び', rule: 'g1_bi_ba', exampleSentence: '大声で 呼ばないで ください。', exampleMeaning: 'Xin đừng gọi lớn tiếng.' },
  { id: 'erabu', kanji: '選びます', hiragana: 'えらびます', naiForm: 'えらばない', naiFormKanji: '選ばない', meaning: 'Chọn', hanViet: 'TUYỂN', group: 1, endingBefore: 'び', rule: 'g1_bi_ba', exampleSentence: '急いで 選ばない ほうがいいです。', exampleMeaning: 'Không nên vội vàng lựa chọn.' },

  // 8. み → ま + ない
  { id: 'nomu', kanji: '飲みます', hiragana: 'のみます', naiForm: 'のまない', naiFormKanji: '飲まない', meaning: 'Uống', hanViet: 'ẨM', group: 1, endingBefore: 'み', rule: 'g1_mi_ma', exampleSentence: '薬を 飲まなければ なりません。', exampleMeaning: 'Phải uống thuốc.' },
  { id: 'yomu', kanji: '読みます', hiragana: 'よみます', naiForm: 'よまない', naiFormKanji: '読まない', meaning: 'Đọc', hanViet: 'ĐỘC', group: 1, endingBefore: 'み', rule: 'g1_mi_ma', exampleSentence: '説明書を 読まないで 使った。', exampleMeaning: 'Đã sử dụng mà không đọc sách hướng dẫn.' },
  { id: 'sumu', kanji: '住みます', hiragana: 'すみます', naiForm: 'すまない', naiFormKanji: '住まない', meaning: 'Sống, ở', hanViet: 'TRÚ', group: 1, endingBefore: 'み', rule: 'g1_mi_ma', exampleSentence: '寮に 住まなくても いいです。', exampleMeaning: 'Không cần ở ký túc xá cũng được.' },
  { id: 'yasumu', kanji: '休みます', hiragana: 'やすみます', naiForm: 'やすまない', naiFormKanji: '休まない', meaning: 'Nghỉ ngơi', hanViet: 'HƯU', group: 1, endingBefore: 'み', rule: 'g1_mi_ma', exampleSentence: '学校を 休まないで ください。', exampleMeaning: 'Xin đừng nghỉ học.' },

  // 9. り → ら + ない
  { id: 'kaeru', kanji: '帰ります', hiragana: 'かえります', naiForm: 'かえらない', naiFormKanji: '帰らない', meaning: 'Về', hanViet: 'QUY', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: 'まだ うちへ 帰らない。', exampleMeaning: 'Tôi vẫn chưa về nhà.' },
  { id: 'tsukuru', kanji: '作ります', hiragana: 'つくります', naiForm: 'つくらない', naiFormKanji: '作らない', meaning: 'Làm, tạo', hanViet: 'TÁC', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: '朝ごはんを 作らないで 買った。', exampleMeaning: 'Không nấu bữa sáng mà đã mua đồ ăn.' },
  { id: 'toru', kanji: '取ります', hiragana: 'とります', naiForm: 'とらない', naiFormKanji: '取らない', meaning: 'Chụp, lấy', hanViet: 'THỦ', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: 'ここで 写真を 撮らないで ください。', exampleMeaning: 'Xin đừng chụp ảnh ở đây.' },
  { id: 'hairu', kanji: '入ります', hiragana: 'はいります', naiForm: 'はいらない', naiFormKanji: '入らない', meaning: 'Vào', hanViet: 'NHẬP', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: '部屋に 入らないで ください。', exampleMeaning: 'Xin đừng vào phòng.' },
  { id: 'shiru', kanji: '知ります', hiragana: 'しります', naiForm: 'しらない', naiFormKanji: '知らない', meaning: 'Biết', hanViet: 'TRI', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: 'その ニュースを 知らない。', exampleMeaning: 'Tôi không biết tin tức đó.' },
  { id: 'kiru_cut', kanji: '切ります', hiragana: 'きります', naiForm: 'きらない', naiFormKanji: '切らない', meaning: 'Cắt', hanViet: 'THIẾT', group: 1, endingBefore: 'り', rule: 'g1_ri_ra', exampleSentence: '髪を 切らない。', exampleMeaning: 'Tôi không cắt tóc.' },

  // 10. Ngoại lệ: あります → ない
  { id: 'aru', kanji: 'あります', hiragana: 'あります', naiForm: 'ない', naiFormKanji: '無い', meaning: 'Có (vật)', hanViet: 'VÔ', group: 1, endingBefore: 'り', rule: 'g1_exception_aru', exampleSentence: '時間が ないから 急ぎます。', exampleMeaning: 'Vì không có thời gian nên tôi sẽ vội.' },
];

// ── Nhóm 2: Bỏ ます + ない ──────────────────────────────────────────
const GROUP2_NAI: NaiFormVerb[] = [
  { id: 'taberu', kanji: '食べます', hiragana: 'たべます', naiForm: 'たべない', naiFormKanji: '食べない', meaning: 'Ăn', hanViet: 'THỰC', group: 2, endingBefore: 'べ', rule: 'g2', exampleSentence: '辛い 物は 食べないで ください。', exampleMeaning: 'Xin đừng ăn đồ cay nóng.' },
  { id: 'miru', kanji: '見ます', hiragana: 'みます', naiForm: 'みない', naiFormKanji: '見ない', meaning: 'Nhìn, xem', hanViet: 'KIẾN', group: 2, endingBefore: 'み', rule: 'g2', exampleSentence: 'テレビを 見ないで 勉強した。', exampleMeaning: 'Học bài mà không xem tivi.' },
  { id: 'okiru', kanji: '起きます', hiragana: 'おきます', naiForm: 'おきない', naiFormKanji: '起きない', meaning: 'Thức dậy', hanViet: 'KHỞI', group: 2, endingBefore: 'き', rule: 'g2', exampleSentence: '休みの 日は 早く 起きなくても いいです。', exampleMeaning: 'Ngày nghỉ không cần dậy sớm cũng được.' },
  { id: 'neru', kanji: '寝ます', hiragana: 'ねます', naiForm: 'ねない', naiFormKanji: '寝ない', meaning: 'Ngủ', hanViet: 'TẨM', group: 2, endingBefore: 'ね', rule: 'g2', exampleSentence: '遅くまで 寝ない ほうがいいです。', exampleMeaning: 'Không nên thức khuya.' },
  { id: 'wasureru', kanji: '忘れます', hiragana: 'わすれます', naiForm: 'わすれない', naiFormKanji: '忘れない', meaning: 'Quên', hanViet: 'VONG', group: 2, endingBefore: 'れ', rule: 'g2', exampleSentence: '約束を 忘れないで ください。', exampleMeaning: 'Xin đừng quên lời hẹn nhé.' },
  { id: 'shimeru', kanji: '閉めます', hiragana: 'しめます', naiForm: 'しめない', naiFormKanji: '閉めない', meaning: 'Đóng', hanViet: 'BẾ', group: 2, endingBefore: 'め', rule: 'g2', exampleSentence: '窓を 閉めないで 寝た。', exampleMeaning: 'Đã đi ngủ mà không đóng cửa sổ.' },
  { id: 'oshieru', kanji: '教えます', hiragana: 'おしえます', naiForm: 'おしえない', naiFormKanji: '教えない', meaning: 'Dạy, chỉ bảo', hanViet: 'GIÁO', group: 2, endingBefore: 'え', rule: 'g2', exampleSentence: 'パスワードを 教えないで ください。', exampleMeaning: 'Xin đừng nói mật khẩu cho ai.' },
  { id: 'kariru', kanji: '借ります', hiragana: 'かります', naiForm: 'かりない', naiFormKanji: '借りない', meaning: 'Mượn', hanViet: 'TÁ', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: 'お金を 借りない ほうがいいです。', exampleMeaning: 'Không nên vay mượn tiền.' },
  { id: 'oriru', kanji: '降ります', hiragana: 'おります', naiForm: 'おりない', naiFormKanji: '降りない', meaning: 'Xuống (xe)', hanViet: 'GIÁNG', group: 2, endingBefore: 'り', rule: 'g2', exampleSentence: 'ここで 降りないで 次の 駅まで 行く。', exampleMeaning: 'Không xuống ở đây mà đi tiếp đến ga sau.' },
  { id: 'tsukeru', kanji: 'つけます', hiragana: 'つけます', naiForm: 'つけない', naiFormKanji: 'つけない', meaning: 'Bật', hanViet: '', group: 2, endingBefore: 'け', rule: 'g2', exampleSentence: 'エアコンを つけないで 過ごした。', exampleMeaning: 'Tôi đã trải qua cả ngày mà không bật điều hòa.' },
];

// ── Nhóm 3: Bất quy tắc ─────────────────────────────────────────────
const GROUP3_NAI: NaiFormVerb[] = [
  { id: 'suru', kanji: 'します', hiragana: 'します', naiForm: 'しない', naiFormKanji: 'しない', meaning: 'Làm', hanViet: '', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '無理を しないで ください。', exampleMeaning: 'Xin đừng làm việc quá sức.' },
  { id: 'kuru', kanji: '来ます', hiragana: 'きます', naiForm: 'こない', naiFormKanji: '来ない', meaning: 'Đến', hanViet: 'LAI', group: 3, endingBefore: 'き', rule: 'g3_kuru', exampleSentence: '明日は 来なくても いいです。', exampleMeaning: 'Ngày mai không cần đến cũng được.' },
  { id: 'shinpai', kanji: '心配します', hiragana: 'しんぱいします', naiForm: 'しんぱいしない', naiFormKanji: '心配しない', meaning: 'Lo lắng', hanViet: 'TÂM PHỐI', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '心配しないで ください。大丈夫です。', exampleMeaning: 'Xin đừng lo lắng, mọi chuyện ổn cả thôi.' },
  { id: 'benkyou', kanji: '勉強します', hiragana: 'べんきょうします', naiForm: 'べんきょうしない', naiFormKanji: '勉強しない', meaning: 'Học', hanViet: 'MIỄN CƯỜNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '勉強しなければ なりません。', exampleMeaning: 'Tôi phải học bài.' },
  { id: 'zangyou', kanji: '残業します', hiragana: 'ざんぎょうします', naiForm: 'ざんぎょうしない', naiFormKanji: '残業しない', meaning: 'Tăng ca', hanViet: 'TÀN NGHIỆP', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '今日は 残業しない。', exampleMeaning: 'Hôm nay tôi không tăng ca.' },
  { id: 'kekkon', kanji: '結婚します', hiragana: 'けっこんします', naiForm: 'けっこんしない', naiFormKanji: '結婚しない', meaning: 'Kết hôn', hanViet: 'KẾT HÔN', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: 'まだ 結婚しない。', exampleMeaning: 'Tôi vẫn chưa kết hôn.' },
  { id: 'undou', kanji: '運動します', hiragana: 'うんどうします', naiForm: 'うんどうしない', naiFormKanji: '運動しない', meaning: 'Vận động', hanViet: 'VẬN ĐỘNG', group: 3, endingBefore: 'し', rule: 'g3_suru', exampleSentence: '運動しないと 体に 悪いです。', exampleMeaning: 'Nếu không vận động thì có hại cho sức khỏe.' },
];

// ── Export toàn bộ danh sách ─────────────────────────────────────────
export const NAI_FORM_VERBS: NaiFormVerb[] = [
  ...GROUP1_NAI,
  ...GROUP2_NAI,
  ...GROUP3_NAI,
];

// ── Nhóm mô tả ───────────────────────────────────────────────────────
export const NAI_GROUP_DESCRIPTIONS: Record<number, string> = {
  1: 'Nhóm 1 (五段動詞 - Godan): Chuyển âm trước「ます」từ cột「い」(い段) sang cột「あ」(あ段) + ない. (⚠️ Chú ý: い → わ, あります → ない).',
  2: 'Nhóm 2 (一段動詞 - Ichidan): Bỏ「ます」+「ない」.',
  3: 'Nhóm 3 (不規則動詞 - Bất quy tắc):「します」→「しない」và「来ます (きます)」→「来ない (こない)」.',
};

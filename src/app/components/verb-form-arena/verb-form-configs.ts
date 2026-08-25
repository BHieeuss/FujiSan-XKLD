import { VerbFormConfig, ConjugationVerb } from './verb-form-arena.models';
import { TE_FORM_VERBS } from '../../pages/te-form/te-form-data';
import { TA_FORM_VERBS } from '../../pages/ta-form/ta-form-data';
import { NAI_FORM_VERBS } from '../../pages/nai-form/nai-form-data';
import { RU_FORM_VERBS } from '../../pages/ru-form/ru-form-data';
import { VOLITIONAL_FORM_VERBS } from '../../pages/volitional-form/volitional-form-data';
import { IMPERATIVE_FORM_VERBS } from '../../pages/imperative-form/imperative-form-data';
import { PROHIBITIVE_FORM_VERBS } from '../../pages/prohibitive-form/prohibitive-form-data';
import { POTENTIAL_FORM_VERBS } from '../../pages/potential-form/potential-form-data';
import { CONDITIONAL_FORM_VERBS } from '../../pages/conditional-form/conditional-form-data';
import { PASSIVE_FORM_VERBS } from '../../pages/passive-form/passive-form-data';
import { CAUSATIVE_FORM_VERBS } from '../../pages/causative-form/causative-form-data';
import { CAUSATIVE_PASSIVE_FORM_VERBS } from '../../pages/causative-passive-form/causative-passive-form-data';

// ══════════════════════════════════════════════════════════════════
//  1. THỂ て (TE-FORM) CONFIG
// ══════════════════════════════════════════════════════════════════
export const TE_FORM_CONFIG: VerbFormConfig = {
  formId: 'te',
  jpBadge: 'て形',
  shortBadge: 'て',
  title: 'Luyện chia thể て',
  subtitle: 'Te-form Practice',
  targetFormPrompt: 'Chia sang thể て',
  audioKeyword: 'てけい',
  verbs: TE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.teForm,
    targetFormKanji: v.teFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「て」',
    description: 'Thể「て」hoặc「で」là dạng chia động từ cơ bản, dùng trong nhiều cấu trúc ngữ pháp: liệt kê hành động, xin phép, trạng thái đang tiếp diễn,...',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Âm trước「ます」thuộc cột「い」(い段). Có 5 quy tắc chia khác nhau tùy theo âm cuối.',
      rules: [
        {
          id: 'g1_tte',
          badge: 'い・ち・り',
          result: 'って',
          description: 'Bỏ「ます」, thay bằng「って」',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かって', toKanji: '買って', meaning: 'Mua' },
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まって', toKanji: '待って', meaning: 'Đợi' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえって', toKanji: '帰って', meaning: 'Về (nhà)' },
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくって', toKanji: '作って', meaning: 'Làm, tạo ra' },
          ],
        },
        {
          id: 'g1_nde',
          badge: 'み・び・に',
          result: 'んで',
          description: 'Bỏ「ます」, thay bằng「んで」',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のんで', toKanji: '飲んで', meaning: 'Uống' },
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそんで', toKanji: '遊んで', meaning: 'Chơi' },
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しんで', toKanji: '死んで', meaning: 'Chết' },
          ],
        },
        {
          id: 'g1_ite',
          badge: 'き',
          result: 'いて',
          description: 'Bỏ「ます」, thay bằng「いて」',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かいて', toKanji: '書いて', meaning: 'Viết' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きいて', toKanji: '聞いて', meaning: 'Nghe, hỏi' },
            { fromHiragana: 'はたらきます', fromKanji: '働きます', toHiragana: 'はたらいて', toKanji: '働いて', meaning: 'Làm việc' },
          ],
        },
        {
          id: 'g1_ide',
          badge: 'ぎ',
          result: 'いで',
          description: 'Bỏ「ます」, thay bằng「いで」',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およいで', toKanji: '泳いで', meaning: 'Bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそいで', toKanji: '急いで', meaning: 'Vội' },
          ],
        },
        {
          id: 'g1_shite',
          badge: 'し',
          result: 'して',
          description: 'Bỏ「ます」, thêm「て」',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなして', toKanji: '話して', meaning: 'Nói chuyện' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だして', toKanji: '出して', meaning: 'Lấy ra, nộp' },
          ],
        },
      ],
      exceptions: {
        title: 'Ngoại lệ',
        examples: [
          { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いって', toKanji: '行って', meaning: 'Đi — Không theo quy tắc き→いて' },
        ],
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Âm trước「ます」thường thuộc cột「え」(え段). Một số động từ đặc biệt kết thúc cột「い」nhưng vẫn thuộc Nhóm 2.',
      rules: [
        {
          id: 'g2_te',
          badge: 'ます',
          result: 'て',
          description: 'Bỏ「ます」, thêm「て」— Đơn giản nhất!',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべて', toKanji: '食べて', meaning: 'Ăn' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みて', toKanji: '見て', meaning: 'Xem, nhìn' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねて', toKanji: '寝て', meaning: 'Ngủ' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきて', toKanji: '起きて', meaning: 'Thức dậy' },
          ],
        },
      ],
      exceptions: {
        title: 'Lưu ý: Động từ Nhóm 2 kết thúc cột「い」',
        note: 'Một số động từ tuy kết thúc bằng âm cột「い」nhưng vẫn thuộc Nhóm 2: 起きます、見ます、降ります、浴びます、落ちます、居ます、出来ます、信じます、借ります、着ます、足ります',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ gốc:「します」(Làm) và「来ます」(Đến). Các từ ghép với「します」cũng thuộc nhóm này.',
      rules: [
        {
          id: 'g3_te',
          badge: 'します・きます',
          result: 'して・きて',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'して', toKanji: 'して', meaning: 'Làm' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうして', toKanji: '勉強して', meaning: 'Học tập' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'きて', toKanji: '来て', meaning: 'Đến' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia thể て ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  2. THỂ た (TA-FORM / QUÁ KHỨ) CONFIG
// ══════════════════════════════════════════════════════════════════
export const TA_FORM_CONFIG: VerbFormConfig = {
  formId: 'ta',
  jpBadge: 'た形',
  shortBadge: 'た',
  title: 'Luyện chia thể Quá khứ (た)',
  subtitle: 'Ta-form Practice',
  targetFormPrompt: 'Chia sang thể た',
  audioKeyword: 'たけい',
  verbs: TA_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.taForm,
    targetFormKanji: v.taFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「た」(Quá khứ)',
    description: 'Thể「た」hoặc「だ」là dạng quá khứ ngắn/thể thông thường, có quy tắc biến âm tương tự như thể「て」(thay て thành た, で thành だ).',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Âm trước「ます」thuộc cột「い」(い段). Có 5 quy tắc chia khác nhau tương tự thể て.',
      rules: [
        {
          id: 'g1_tta',
          badge: 'い・ち・り',
          result: 'った',
          description: 'Bỏ「ます」, thay bằng「った」',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かった', toKanji: '買った', meaning: 'Mua' },
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まった', toKanji: '待った', meaning: 'Đợi' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえった', toKanji: '帰った', meaning: 'Về (nhà)' },
          ],
        },
        {
          id: 'g1_nda',
          badge: 'み・び・に',
          result: 'んだ',
          description: 'Bỏ「ます」, thay bằng「んだ」',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のんだ', toKanji: '飲んだ', meaning: 'Uống' },
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそんだ', toKanji: '遊んだ', meaning: 'Chơi' },
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しんだ', toKanji: '死んだ', meaning: 'Chết' },
          ],
        },
        {
          id: 'g1_ita',
          badge: 'き',
          result: 'いた',
          description: 'Bỏ「ます」, thay bằng「いた」',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かいた', toKanji: '書いた', meaning: 'Viết' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きいた', toKanji: '聞いた', meaning: 'Nghe' },
          ],
        },
        {
          id: 'g1_ida',
          badge: 'ぎ',
          result: 'いだ',
          description: 'Bỏ「ます」, thay bằng「いだ」',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およいだ', toKanji: '泳いだ', meaning: 'Bơi' },
          ],
        },
        {
          id: 'g1_shita',
          badge: 'し',
          result: 'した',
          description: 'Bỏ「ます」, thêm「た」',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなした', toKanji: '話した', meaning: 'Nói chuyện' },
          ],
        },
      ],
      exceptions: {
        title: 'Ngoại lệ',
        examples: [
          { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いった', toKanji: '行った', meaning: 'Đi — Không theo quy tắc き→いた' },
        ],
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Âm trước「ます」thường thuộc cột「え」(え段). Quy tắc: Bỏ「ます」, thêm「た」.',
      rules: [
        {
          id: 'g2_ta',
          badge: 'ます',
          result: 'た',
          description: 'Bỏ「ます」, thêm「た」— Đơn giản nhất!',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべた', toKanji: '食べた', meaning: 'Ăn' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みた', toKanji: '見た', meaning: 'Xem, nhìn' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ gốc:「します」(Làm) và「来ます」(Đến).',
      rules: [
        {
          id: 'g3_ta',
          badge: 'します・きます',
          result: 'した・きた',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'した', toKanji: 'した', meaning: 'Làm' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'きた', toKanji: '来た', meaning: 'Đến' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia thể Quá khứ (た) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm và ghép từ để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  3. THỂ ない (NAI-FORM / PHỦ ĐỊNH) CONFIG
// ══════════════════════════════════════════════════════════════════
export const NAI_FORM_CONFIG: VerbFormConfig = {
  formId: 'nai',
  jpBadge: 'ない形',
  shortBadge: 'な',
  title: 'Luyện chia thể Phủ định (ない)',
  subtitle: 'Nai-form Practice',
  targetFormPrompt: 'Chia sang thể ない',
  audioKeyword: 'ないけい',
  verbs: NAI_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.naiForm,
    targetFormKanji: v.naiFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「ない」(Phủ định)',
    description: 'Thể「ない」là dạng phủ định ngắn (thể thông thường), dùng để diễn tả phủ định trong giao tiếp thân mật và làm gốc cho các mẫu câu khuyên can, bắt buộc,...',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「あ」và thêm「ない」.',
      rules: [
        {
          id: 'g1_wa',
          badge: 'い',
          result: 'わない',
          description: '⚠️ Đuôi「い」chuyển thành「わ」rồi thêm「ない」(không chuyển thành「あ」!)',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かわない', toKanji: '買わない', meaning: 'Không mua' },
            { fromHiragana: 'あいます', fromKanji: '会います', toHiragana: 'あわない', toKanji: '会わない', meaning: 'Không gặp' },
          ],
        },
        {
          id: 'g1_ka',
          badge: 'き',
          result: 'かない',
          description: 'Bỏ「ます」, đổi「き」thành「か」+「ない」',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かかない', toKanji: '書かない', meaning: 'Không viết' },
          ],
        },
        {
          id: 'g1_ga',
          badge: 'ぎ',
          result: 'がない',
          description: 'Bỏ「ます」, đổi「ぎ」thành「가」+「ない」',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およがない', toKanji: '泳がない', meaning: 'Không bơi' },
          ],
        },
        {
          id: 'g1_sa',
          badge: 'し',
          result: 'さない',
          description: 'Bỏ「ます」, đổi「し」thành「さ」+「ない」',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなさない', toKanji: '話さない', meaning: 'Không nói chuyện' },
          ],
        },
        {
          id: 'g1_ta',
          badge: 'ち',
          result: 'たない',
          description: 'Bỏ「ます」, đổi「ち」thành「た」+「ない」',
          examples: [
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たたない', toKanji: '立たない', meaning: 'Không đứng' },
          ],
        },
        {
          id: 'g1_ra',
          badge: 'に・び・み・り',
          result: 'な・ば・ま・らない',
          description: 'Đổi sang âm tương ứng ở cột「あ」+「ない」',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しなない', toKanji: '死なない', meaning: 'Không chết' },
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそばない', toKanji: '遊ばない', meaning: 'Không chơi' },
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のまない', toKanji: '飲まない', meaning: 'Không uống' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえらない', toKanji: '帰らない', meaning: 'Không về' },
          ],
        },
      ],
      exceptions: {
        title: 'Ngoại lệ đặc biệt',
        examples: [
          { fromHiragana: 'あります', fromKanji: 'あります', toHiragana: 'ない', toKanji: 'ない', meaning: 'Không có (Biến đổi hoàn toàn thành「ない」)' },
        ],
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「ない」.',
      rules: [
        {
          id: 'g2_nai',
          badge: 'ます',
          result: 'ない',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべない', toKanji: '食べない', meaning: 'Không ăn' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みない', toKanji: '見ない', meaning: 'Không xem' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねない', toKanji: '寝ない', meaning: 'Không ngủ' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきない', toKanji: '起きない', meaning: 'Không thức dậy' },
          ],
        },
      ],
      exceptions: {
        title: 'Lưu ý: Động từ Nhóm 2 kết thúc cột「い」',
        note: 'Một số động từ tuy kết thúc bằng âm cột「い」nhưng vẫn thuộc Nhóm 2: 起きます、見ます、降ります、浴びます、落ちます、居ます、出来ます、信じます、借ります、着ます、足ります',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Bao gồm 2 động từ chính:「します」và「来ます」(きます).',
      rules: [
        {
          id: 'g3_nai',
          badge: 'します・きます',
          result: 'しない・こない',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'しない', toKanji: 'しない', meaning: 'Không làm' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こない', toKanji: '来ない', meaning: 'Không đến (⚠️ đọc là ko-nai)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia thể Phủ định (ない) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm và ghép từ để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  4. THỂ TỪ ĐIỂN (RU-FORM / JISHOKEI) CONFIG
// ══════════════════════════════════════════════════════════════════
export const RU_FORM_CONFIG: VerbFormConfig = {
  formId: 'ru',
  jpBadge: '辞書形',
  shortBadge: 'る',
  title: 'Luyện chia thể Từ điển (る)',
  subtitle: 'Jishokei / Ru-form Practice',
  targetFormPrompt: 'Chia sang thể Từ điển (る)',
  audioKeyword: 'じしょけい',
  verbs: RU_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.ruForm,
    targetFormKanji: v.ruFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Từ Điển (る)」',
    description: 'Thể Từ Điển (hoặc thể る / 辞書形) là dạng nguyên mẫu của động từ xuất hiện trong từ điển, dùng diễn đạt hành động ở hiện tại/tương lai trong giao tiếp thân mật.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「う」và bỏ「ます」.',
      rules: [
        {
          id: 'g1_u',
          badge: 'い',
          result: 'う',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かう', toKanji: '買う', meaning: 'Mua' },
            { fromHiragana: 'あいます', fromKanji: '会います', toHiragana: 'あう', toKanji: '会う', meaning: 'Gặp' },
            { fromHiragana: 'いいます', fromKanji: '言います', toHiragana: 'いう', toKanji: '言う', meaning: 'Nói' },
          ],
        },
        {
          id: 'g1_ku',
          badge: 'き',
          result: 'く',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かく', toKanji: '書く', meaning: 'Viết' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きく', toKanji: '聞く', meaning: 'Nghe' },
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いく', toKanji: '行く', meaning: 'Đi' },
          ],
        },
        {
          id: 'g1_gu',
          badge: 'ぎ',
          result: 'ぐ',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およぐ', toKanji: '泳ぐ', meaning: 'Bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそぐ', toKanji: '急ぐ', meaning: 'Vội' },
          ],
        },
        {
          id: 'g1_su',
          badge: 'し',
          result: 'す',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなす', toKanji: '話す', meaning: 'Nói chuyện' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だす', toKanji: '出す', meaning: 'Lấy ra, nộp' },
          ],
        },
        {
          id: 'g1_tsu',
          badge: 'ち',
          result: 'つ',
          examples: [
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たつ', toKanji: '立つ', meaning: 'Đứng' },
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まつ', toKanji: '待つ', meaning: 'Đợi' },
            { fromHiragana: 'もちます', fromKanji: '持ちます', toHiragana: 'もつ', toKanji: '持つ', meaning: 'Cầm, mang' },
          ],
        },
        {
          id: 'g1_ru',
          badge: 'に・び・み・り',
          result: 'ぬ・ぶ・む・る',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しぬ', toKanji: '死ぬ', meaning: 'Chết' },
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそぶ', toKanji: '遊ぶ', meaning: 'Chơi' },
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のむ', toKanji: '飲む', meaning: 'Uống' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえる', toKanji: '帰る', meaning: 'Về' },
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくる', toKanji: '作る', meaning: 'Làm' },
          ],
        },
      ],
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「る」.',
      rules: [
        {
          id: 'g2_ru',
          badge: 'ます',
          result: 'る',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべる', toKanji: '食べる', meaning: 'Ăn' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みる', toKanji: '見る', meaning: 'Xem' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねる', toKanji: '寝る', meaning: 'Ngủ' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきる', toKanji: '起きる', meaning: 'Thức dậy' },
          ],
        },
      ],
      exceptions: {
        title: 'Lưu ý: Động từ Nhóm 2 kết thúc cột「い」',
        note: 'Một số động từ tuy kết thúc bằng âm cột「い」nhưng vẫn thuộc Nhóm 2: 起きます、見ます、降ります、浴びます、落ちます、居ます、出来ます、信じます、借ります、着ます、足ります',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Bao gồm 2 động từ chính:「します」và「来ます」(きます).',
      rules: [
        {
          id: 'g3_ru',
          badge: 'します・きます',
          result: 'する・くる',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'する', toKanji: 'する', meaning: 'Làm' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'くる', toKanji: '来る', meaning: 'Đến (⚠️ đọc là ku-ru)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia thể Từ điển (る) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm và ghép từ để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  5. THỂ Ý CHÍ (VOLITIONAL / IKOUKEI / よう) CONFIG
// ══════════════════════════════════════════════════════════════════
export const VOLITIONAL_FORM_CONFIG: VerbFormConfig = {
  formId: 'volitional',
  jpBadge: '意向形',
  shortBadge: '意',
  title: 'Luyện chia thể Ý chí (よう)',
  subtitle: 'Volitional Form Practice',
  targetFormPrompt: 'Chia sang thể Ý chí (よう)',
  audioKeyword: 'いこうけい',
  verbs: VOLITIONAL_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.volitionalForm,
    targetFormKanji: v.volitionalFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Ý Chí (よう)」',
    description: 'Thể Ý Chí (意向形 — Ikoukei) là dạng thông thường (ngắn) của「〜ましょう」, dùng để rủ rê, đề nghị hoặc biểu thị ý chí, quyết tâm làm một việc gì đó.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「お」rồi thêm「う」(trường âm).',
      rules: [
        {
          id: 'g1_ou',
          badge: 'い',
          result: 'おう',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かおう', toKanji: '買おう', meaning: 'Mua / Cùng mua nào' },
          ],
        },
        {
          id: 'g1_kou',
          badge: 'き',
          result: 'こう',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かこう', toKanji: '書こう', meaning: 'Viết / Cùng viết nào' },
          ],
        },
        {
          id: 'g1_gou',
          badge: 'ぎ',
          result: 'ごう',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およごう', toKanji: '泳ごう', meaning: 'Bơi / Cùng bơi nào' },
          ],
        },
        {
          id: 'g1_sou',
          badge: 'し',
          result: 'そう',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなそう', toKanji: '話そう', meaning: 'Nói chuyện / Cùng nói chuyện nào' },
          ],
        },
        {
          id: 'g1_tou',
          badge: 'ち',
          result: 'とう',
          examples: [
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たとう', toKanji: '立とう', meaning: 'Đứng / Cùng đứng nào' },
          ],
        },
        {
          id: 'g1_mou',
          badge: 'に・び・み・り',
          result: 'のう・ぼう・もう・ろう',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のもう', toKanji: '飲もう', meaning: 'Uống / Cùng uống nào' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえろう', toKanji: '帰ろう', meaning: 'Về / Cùng về nào' },
          ],
        },
      ],
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「よう」.',
      rules: [
        {
          id: 'g2_you',
          badge: 'ます',
          result: 'よう',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべよう', toKanji: '食べよう', meaning: 'Ăn / Cùng ăn nào' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みよう', toKanji: '見よう', meaning: 'Xem / Cùng xem nào' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Bao gồm 2 động từ chính:「します」và「来ます」(きます).',
      rules: [
        {
          id: 'g3_you',
          badge: 'します・きます',
          result: 'しよう・こよう',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'しよう', toKanji: 'しよう', meaning: 'Làm / Cùng làm nào' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こよう', toKanji: '来よう', meaning: 'Đến / Cùng đến nào (⚠️ đọc là ko-you)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia thể Ý chí (よう) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm và ghép từ để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  6. THỂ MỆNH LỆNH (IMPERATIVE / MEIREIKEI / 命令形) CONFIG
// ══════════════════════════════════════════════════════════════════
export const IMPERATIVE_FORM_CONFIG: VerbFormConfig = {
  formId: 'imperative',
  jpBadge: '命令形',
  shortBadge: '令',
  title: 'Luyện chia Thể Mệnh Lệnh',
  subtitle: 'Imperative Form Practice',
  targetFormPrompt: 'Chia sang thể Mệnh Lệnh',
  audioKeyword: 'めいれいけい',
  verbs: IMPERATIVE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.imperativeForm,
    targetFormKanji: v.imperativeFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Mệnh Lệnh (命令形)」',
    description: 'Thể Mệnh Lệnh (命令形 — Meireikei) dùng để ra lệnh, sai khiến một cách dứt khoát, thường dùng trong khẩu lệnh huấn luyện, cổ vũ thể thao, tình huống khẩn cấp hoặc biển báo hiệu.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「え」và bỏ「ます」.',
      rules: [
        {
          id: 'g1_e',
          badge: 'い',
          result: 'え',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かえ', toKanji: '買え', meaning: 'Mua đi!' },
            { fromHiragana: 'あいます', fromKanji: '会います', toHiragana: 'あえ', toKanji: '会え', meaning: 'Gặp đi!' },
          ],
        },
        {
          id: 'g1_ke',
          badge: 'き',
          result: 'け',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かけ', toKanji: '書け', meaning: 'Viết đi!' },
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いけ', toKanji: '行け', meaning: 'Đi đi!' },
            { fromHiragana: 'はたらきます', fromKanji: '働きます', toHiragana: 'はたらけ', toKanji: '働け', meaning: 'Làm việc đi!' },
          ],
        },
        {
          id: 'g1_ge',
          badge: 'ぎ',
          result: 'げ',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およげ', toKanji: '泳げ', meaning: 'Bơi đi!' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそげ', toKanji: '急げ', meaning: 'Khẩn trương lên!' },
          ],
        },
        {
          id: 'g1_se',
          badge: 'し',
          result: 'せ',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなせ', toKanji: '話せ', meaning: 'Nói đi!' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だせ', toKanji: '出せ', meaning: 'Nộp ra / Đưa ra mau!' },
          ],
        },
        {
          id: 'g1_te',
          badge: 'ち',
          result: 'て',
          examples: [
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まて', toKanji: '待て', meaning: 'Đợi đã / Dừng lại!' },
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たて', toKanji: '立て', meaning: 'Đứng dậy!' },
          ],
        },
        {
          id: 'g1_ne',
          badge: 'に',
          result: 'ね',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しね', toKanji: '死ね', meaning: 'Chết đi' },
          ],
        },
        {
          id: 'g1_be',
          badge: 'び',
          result: 'べ',
          examples: [
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそべ', toKanji: '遊べ', meaning: 'Chơi đi!' },
            { fromHiragana: 'よびます', fromKanji: '呼びます', toHiragana: 'よべ', toKanji: '呼べ', meaning: 'Gọi mau!' },
          ],
        },
        {
          id: 'g1_me',
          badge: 'み',
          result: 'め',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のめ', toKanji: '飲め', meaning: 'Uống đi!' },
            { fromHiragana: 'よみます', fromKanji: '読みます', toHiragana: 'よめ', toKanji: '読め', meaning: 'Đọc đi!' },
            { fromHiragana: 'やすみます', fromKanji: '休みます', toHiragana: 'やすめ', toKanji: '休め', meaning: 'Nghỉ ngơi đi / Nghiêm!' },
          ],
        },
        {
          id: 'g1_re',
          badge: 'り',
          result: 'れ',
          examples: [
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえれ', toKanji: '帰れ', meaning: 'Về đi!' },
            { fromHiragana: 'がんばります', fromKanji: '頑張ります', toHiragana: 'がんばれ', toKanji: '頑張れ', meaning: 'Cố lên!' },
            { fromHiragana: 'とまります', fromKanji: '止まります', toHiragana: 'とまれ', toKanji: '止まれ', meaning: 'Dừng lại!' },
          ],
        },
      ],
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「ろ」.',
      rules: [
        {
          id: 'g2_ro',
          badge: 'ます',
          result: 'ろ',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべろ', toKanji: '食べろ', meaning: 'Ăn đi!' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みろ', toKanji: '見ろ', meaning: 'Nhìn kìa / Xem đi!' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねろ', toKanji: '寝ろ', meaning: 'Ngủ đi!' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきろ', toKanji: '起きろ', meaning: 'Dậy mau!' },
            { fromHiragana: 'あけます', fromKanji: '開けます', toHiragana: 'あけろ', toKanji: '開けろ', meaning: 'Mở cửa ra!' },
            { fromHiragana: 'とめます', fromKanji: '止めます', toHiragana: 'とめろ', toKanji: '止めろ', meaning: 'Dừng lại ngay!' },
          ],
        },
      ],
      exceptions: {
        title: 'Ngoại lệ đặc biệt: 呉れます (くれます)',
        note: 'Động từ「くれます」(cho tôi) khi chuyển sang mệnh lệnh sẽ là「くれ」(không phải くレろ). Ví dụ: 見せてくれ (Cho tôi xem với).',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Bao gồm 2 động từ chính:「します」và「来ます」(きます).',
      rules: [
        {
          id: 'g3_meirei',
          badge: 'します・きます',
          result: 'しろ・こい',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'しろ', toKanji: 'しろ', meaning: 'Làm đi!' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうしろ', toKanji: '勉強しろ', meaning: 'Học bài đi!' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こい', toKanji: '来い', meaning: 'Đến đây mau! (⚠️ đọc là ko-i)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Mệnh Lệnh ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  7. THỂ CẤM CHỈ (PROHIBITIVE / KINSHIKEI / 禁止形 / な) CONFIG
// ══════════════════════════════════════════════════════════════════
export const PROHIBITIVE_FORM_CONFIG: VerbFormConfig = {
  formId: 'prohibitive',
  jpBadge: '禁止形',
  shortBadge: '禁',
  title: 'Luyện chia Thể Cấm Chỉ (な)',
  subtitle: 'Prohibitive Form Practice',
  targetFormPrompt: 'Chia sang thể Cấm Chỉ (な)',
  audioKeyword: 'きんしけい',
  verbs: PROHIBITIVE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.prohibitiveForm,
    targetFormKanji: v.prohibitiveFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Cấm Chỉ (禁止形 / な)」',
    description: 'Thể Cấm Chỉ (禁止形 — Kinshikei) dùng để nghiêm cấm hành vi nào đó ("Cấm không được..."), mang tính bắt buộc và răn đe mạnh, thường gặp trong biển báo công cộng, tín hiệu giao thông, hoặc khẩu lệnh khẩn cấp.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển sang Thể Từ Điển (đuôi cột「う」) rồi thêm trực tiếp「な」.',
      rules: [
        {
          id: 'g1_u_na',
          badge: 'い → う',
          result: 'う + な',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かうな', toKanji: '買うな', meaning: 'Cấm mua!' },
            { fromHiragana: 'すいます', fromKanji: '吸います', toHiragana: 'すうな', toKanji: '吸うな', meaning: 'Cấm hút thuốc!' },
            { fromHiragana: 'つかいます', fromKanji: '使います', toHiragana: 'つかうな', toKanji: '使うな', meaning: 'Cấm sử dụng!' },
          ],
        },
        {
          id: 'g1_ku_na',
          badge: 'き → く',
          result: 'く + な',
          examples: [
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いくな', toKanji: '行くな', meaning: 'Cấm đi!' },
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かくな', toKanji: '書くな', meaning: 'Cấm vẽ bậy / viết!' },
            { fromHiragana: 'おきます', fromKanji: '置きます', toHiragana: 'おくな', toKanji: '置くな', meaning: 'Cấm để đồ ở đây!' },
          ],
        },
        {
          id: 'g1_gu_na',
          badge: 'ぎ → ぐ',
          result: 'ぐ + な',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およぐな', toKanji: '泳ぐな', meaning: 'Cấm bơi lội (遊泳禁止)!' },
          ],
        },
        {
          id: 'g1_su_na',
          badge: 'し → す',
          result: 'す + な',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなすな', toKanji: '話すな', meaning: 'Cấm nói chuyện!' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だすな', toKanji: '出すな', meaning: 'Cấm thò tay/đầu ra ngoài!' },
            { fromHiragana: 'おします', fromKanji: '押します', toHiragana: 'おすな', toKanji: '押すな', meaning: 'Cấm xô đẩy!' },
          ],
        },
        {
          id: 'g1_tsu_na',
          badge: 'ち → つ',
          result: 'つ + な',
          examples: [
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たつな', toKanji: '立つな', meaning: 'Cấm đứng dậy!' },
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まつな', toKanji: '待つな', meaning: 'Cấm chờ ở đây!' },
          ],
        },
        {
          id: 'g1_nu_na',
          badge: 'に → ぬ',
          result: 'ぬ + な',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しぬな', toKanji: '死ぬな', meaning: 'Cấm chết / Đừng chết!' },
          ],
        },
        {
          id: 'g1_bu_na',
          badge: 'び → ぶ',
          result: 'ぶ + な',
          examples: [
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそぶな', toKanji: '遊ぶな', meaning: 'Cấm đùa nghịch!' },
          ],
        },
        {
          id: 'g1_mu_na',
          badge: 'み → む',
          result: 'む + な',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のむな', toKanji: '飲むな', meaning: 'Cấm uống (rượu khi lái xe)!' },
          ],
        },
        {
          id: 'g1_ru_na',
          badge: 'り → る',
          result: 'る + な',
          examples: [
            { fromHiragana: 'はいります', fromKanji: '入ります', toHiragana: 'はいるな', toKanji: '入るな', meaning: 'Cấm vào (立入禁止)!' },
            { fromHiragana: 'さわります', fromKanji: '触ります', toHiragana: 'さわるな', toKanji: '触るな', meaning: 'Cấm sờ vào hiện vật!' },
            { fromHiragana: 'とります', fromKanji: '撮ります', toHiragana: 'とるな', toKanji: '撮るな', meaning: 'Cấm chụp ảnh (撮影禁止)!' },
            { fromHiragana: 'とまります', fromKanji: '止まります', toHiragana: 'とまるな', toKanji: '止まるな', meaning: 'Cấm dừng xe (駐車禁止)!' },
          ],
        },
      ],
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」thêm「る」để thành Thể Từ Điển rồi thêm「な」.',
      rules: [
        {
          id: 'g2_ru_na',
          badge: 'ます → る + な',
          result: 'る + な',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべるな', toKanji: '食べるな', meaning: 'Cấm ăn (đồ ngọt/trong rạp)!' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みるな', toKanji: '見るな', meaning: 'Cấm nhìn lén!' },
            { fromHiragana: 'すてます', fromKanji: '捨てます', toHiragana: 'すてるな', toKanji: '捨てるな', meaning: 'Cấm vứt rác bừa bãi!' },
            { fromHiragana: 'とめます', fromKanji: '止めます', toHiragana: 'とめるな', toKanji: '止めるな', meaning: 'Cấm đỗ xe ở đây!' },
            { fromHiragana: 'わすれます', fromKanji: '忘れます', toHiragana: 'わすれるな', toKanji: '忘れるな', meaning: 'Cấm quên / Đừng quên!' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Bao gồm 2 động từ chính:「します」(→ するな) và「来ます」(→ 来るな / くるな).',
      rules: [
        {
          id: 'g3_kinshi',
          badge: 'するな・くるな',
          result: 'するな・くるな',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'するな', toKanji: 'するな', meaning: 'Cấm làm!' },
            { fromHiragana: 'ちゅうしゃします', fromKanji: '駐車します', toHiragana: 'ちゅうしゃするな', toKanji: '駐車するな', meaning: 'Cấm đỗ xe!' },
            { fromHiragana: 'うんてんします', fromKanji: '運転します', toHiragana: 'うんてんするな', toKanji: '運転するな', meaning: 'Cấm lái xe!' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'くるな', toKanji: '来るな', meaning: 'Cấm đến / Đừng lại gần! (⚠️ đọc là ku-ru-na)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Cấm Chỉ (な) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  8. THỂ KHẢ NĂNG (POTENTIAL / KANOUKEI / 可能形) CONFIG
// ══════════════════════════════════════════════════════════════════
export const POTENTIAL_FORM_CONFIG: VerbFormConfig = {
  formId: 'potential',
  jpBadge: '可能形',
  shortBadge: '能',
  title: 'Luyện chia Thể Khả Năng',
  subtitle: 'Potential Form Practice',
  targetFormPrompt: 'Chia sang thể Khả Năng',
  audioKeyword: 'かのうけい',
  verbs: POTENTIAL_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.potentialForm,
    targetFormKanji: v.potentialFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Khả Năng (可能形)」',
    description: 'Thể Khả Năng (可能形 — Kanoukei) biểu thị năng lực hoặc điều kiện cho phép thực hiện hành động ("Có thể làm..."). ⚠️ Trong câu thể khả năng, tân ngữ「〜を」chuyển thành「〜が」.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「え」rồi thêm「る」(hoặc「ます」).',
      rules: [
        {
          id: 'g1_eru',
          badge: 'い → える',
          result: 'える',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かえる', toKanji: '買える', meaning: 'Có thể mua' },
            { fromHiragana: 'あいます', fromKanji: '会います', toHiragana: 'あえる', toKanji: '会える', meaning: 'Có thể gặp' },
            { fromHiragana: 'つかいます', fromKanji: '使います', toHiragana: 'つかえる', toKanji: '使える', meaning: 'Có thể dùng / dùng được' },
          ],
        },
        {
          id: 'g1_keru',
          badge: 'き → ける',
          result: 'ける',
          examples: [
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いける', toKanji: '行ける', meaning: 'Có thể đi' },
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かける', toKanji: '書ける', meaning: 'Có thể viết (Kanji...)' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きける', toKanji: '聞ける', meaning: 'Có thể nghe (radio...)' },
          ],
        },
        {
          id: 'g1_geru',
          badge: 'ぎ → げる',
          result: 'げる',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およげる', toKanji: '泳げる', meaning: 'Có thể bơi (25m...)' },
          ],
        },
        {
          id: 'g1_seru',
          badge: 'し → せる',
          result: 'せる',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなせる', toKanji: '話せる', meaning: 'Có thể nói (tiếng Nhật...)' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だせる', toKanji: '出せる', meaning: 'Có thể nộp / đưa ra' },
          ],
        },
        {
          id: 'g1_teru',
          badge: 'ち → てる',
          result: 'てる',
          examples: [
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たてる', toKanji: '立てる', meaning: 'Có thể đứng' },
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まてる', toKanji: '待てる', meaning: 'Có thể đợi' },
          ],
        },
        {
          id: 'g1_neru',
          badge: 'に → ねる',
          result: 'ねる',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しねる', toKanji: '死ねる', meaning: 'Có thể chết' },
          ],
        },
        {
          id: 'g1_beru',
          badge: 'び → べる',
          result: 'べる',
          examples: [
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそべる', toKanji: '遊べる', meaning: 'Có thể chơi' },
            { fromHiragana: 'よびます', fromKanji: '呼びます', toHiragana: 'よべる', toKanji: '呼べる', meaning: 'Có thể gọi' },
          ],
        },
        {
          id: 'g1_meru',
          badge: 'み → める',
          result: 'める',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のめる', toKanji: '飲める', meaning: 'Có thể uống (rượu...)' },
            { fromHiragana: 'よみます', fromKanji: '読みます', toHiragana: 'よめる', toKanji: '読める', meaning: 'Có thể đọc' },
          ],
        },
        {
          id: 'g1_reru',
          badge: 'り → れる',
          result: 'れる',
          examples: [
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえれる', toKanji: '帰れる', meaning: 'Có thể về' },
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくれる', toKanji: '作れる', meaning: 'Có thể làm (món ăn...)' },
            { fromHiragana: 'はしります', fromKanji: '走ります', toHiragana: 'はしれる', toKanji: '走れる', meaning: 'Có thể chạy' },
          ],
        },
      ],
      exceptions: {
        title: 'Phân biệt: 聞ける vs 聞こえる',
        note: '「聞ける」(きける): Có khả năng nghe theo chủ ý (ví dụ: Có thể nghe nhạc bằng tai nghe). Khác với「聞こえる」(きこえる): Tự nhiên âm thanh lọt vào tai (ví dụ: Nghe thấy tiếng chim hót).',
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「られる」(hoặc「られます」).',
      rules: [
        {
          id: 'g2_rareru',
          badge: 'ます → られる',
          result: 'られる',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべられる', toKanji: '食べられる', meaning: 'Có thể ăn (đồ sống...)' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みられる', toKanji: '見られる', meaning: 'Có thể xem (phim...)' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきられる', toKanji: '起きられる', meaning: 'Có thể dậy sớm' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねられる', toKanji: '寝られる', meaning: 'Có thể ngủ được' },
            { fromHiragana: 'あけます', fromKanji: '開けます', toHiragana: 'あけられる', toKanji: '開けられる', meaning: 'Có thể mở' },
            { fromHiragana: 'おぼえます', fromKanji: '覚えます', toHiragana: 'おぼえられる', toKanji: '覚えられる', meaning: 'Có thể nhớ' },
          ],
        },
      ],
      exceptions: {
        title: 'Phân biệt: 見られる vs 見える',
        note: '「見られる」(みられる): Có thể xem/nhìn theo chủ ý (ví dụ: Có thể xem phim trên Netflix). Khác với「見える」(みえる): Tự nhiên nhìn thấy trong tầm mắt (ví dụ: Từ cửa sổ nhìn thấy núi Phú Sĩ).',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ chính:「します」(→ できる / 出来ます) và「来ます」(→ 来られる / こられる).',
      rules: [
        {
          id: 'g3_potential',
          badge: 'します・きます',
          result: 'できる・こられる',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'できる', toKanji: '出来る', meaning: 'Có thể làm / Biết làm' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうできる', toKanji: '勉強出来る', meaning: 'Có thể học' },
            { fromHiragana: 'うんてんします', fromKanji: '運転します', toHiragana: 'うんてんできる', toKanji: '運転出来る', meaning: 'Có thể lái xe' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こられる', toKanji: '来られる', meaning: 'Có thể đến (⚠️ đọc là ko-ra-re-ru)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Khả Năng ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  9. THỂ ĐIỀU KIỆN (CONDITIONAL / JOUKENKEI / 条件形 / ば) CONFIG
// ══════════════════════════════════════════════════════════════════
export const CONDITIONAL_FORM_CONFIG: VerbFormConfig = {
  formId: 'conditional',
  jpBadge: '条件形',
  shortBadge: '条',
  title: 'Luyện chia Thể Điều Kiện (ば)',
  subtitle: 'Conditional Form (Ba-form) Practice',
  targetFormPrompt: 'Chia sang thể Điều Kiện (ば)',
  audioKeyword: 'じょうけんけい',
  verbs: CONDITIONAL_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.conditionalForm,
    targetFormKanji: v.conditionalFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Điều Kiện (条件形 / ば)」',
    description: 'Thể Điều Kiện (条件形 — Joukenkei / Thể「ば」) dùng để biểu thị điều kiện cần thiết để một sự việc xảy ra ("Nếu... thì..."), hoặc dùng để đưa ra lời khuyên, chỉ dẫn.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「え」rồi thêm「ば」.',
      rules: [
        {
          id: 'g1_eba',
          badge: 'い → えば',
          result: 'えば',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かえば', toKanji: '買えば', meaning: 'Nếu mua' },
            { fromHiragana: 'あいます', fromKanji: '会います', toHiragana: 'あえば', toKanji: '会えば', meaning: 'Nếu gặp' },
            { fromHiragana: 'つかいます', fromKanji: '使います', toHiragana: 'つかえば', toKanji: '使えば', meaning: 'Nếu sử dụng' },
          ],
        },
        {
          id: 'g1_keba',
          badge: 'き → けば',
          result: 'けば',
          examples: [
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いけば', toKanji: '行けば', meaning: 'Nếu đi' },
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かけば', toKanji: '書けば', meaning: 'Nếu viết' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きけば', toKanji: '聞けば', meaning: 'Nếu nghe / hỏi' },
          ],
        },
        {
          id: 'g1_geba',
          badge: 'ぎ → げば',
          result: 'げば',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およげば', toKanji: '泳げば', meaning: 'Nếu bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそげば', toKanji: '急げば', meaning: 'Nếu vội' },
          ],
        },
        {
          id: 'g1_seba',
          badge: 'し → せば',
          result: 'せば',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなせば', toKanji: '話せば', meaning: 'Nếu nói chuyện' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'だせば', toKanji: '出せば', meaning: 'Nếu nộp / đưa ra' },
          ],
        },
        {
          id: 'g1_teba',
          badge: 'ち → てば',
          result: 'てば',
          examples: [
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'まてば', toKanji: '待てば', meaning: 'Nếu đợi' },
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たてば', toKanji: '立てば', meaning: 'Nếu đứng' },
          ],
        },
        {
          id: 'g1_neba',
          badge: 'に → ねば',
          result: 'ねば',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しねば', toKanji: '死ねば', meaning: 'Nếu chết' },
          ],
        },
        {
          id: 'g1_beba',
          badge: 'び → べば',
          result: 'べば',
          examples: [
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそべば', toKanji: '遊べば', meaning: 'Nếu chơi' },
            { fromHiragana: 'よびます', fromKanji: '呼びます', toHiragana: 'よべば', toKanji: '呼べば', meaning: 'Nếu gọi' },
          ],
        },
        {
          id: 'g1_meba',
          badge: 'み → めば',
          result: 'めば',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のめば', toKanji: '飲めば', meaning: 'Nếu uống' },
            { fromHiragana: 'よみます', fromKanji: '読みます', toHiragana: 'よめば', toKanji: '読めば', meaning: 'Nếu đọc' },
          ],
        },
        {
          id: 'g1_reba',
          badge: 'り → れば',
          result: 'れば',
          examples: [
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえれば', toKanji: '帰れば', meaning: 'Nếu về' },
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくれば', toKanji: '作れば', meaning: 'Nếu làm' },
            { fromHiragana: 'がんばります', fromKanji: '頑張ります', toHiragana: 'がんばれば', toKanji: '頑張れば', meaning: 'Nếu cố gắng' },
          ],
        },
      ],
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「れば」.',
      rules: [
        {
          id: 'g2_reba',
          badge: 'ます → れば',
          result: 'れば',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべれば', toKanji: '食べれば', meaning: 'Nếu ăn' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みれば', toKanji: '見れば', meaning: 'Nếu xem' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきれば', toKanji: '起きれば', meaning: 'Nếu thức dậy' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねれば', toKanji: '寝れば', meaning: 'Nếu ngủ' },
            { fromHiragana: 'あけます', fromKanji: '開けます', toHiragana: 'あければ', toKanji: '開ければ', meaning: 'Nếu mở' },
            { fromHiragana: 'おぼえます', fromKanji: '覚えます', toHiragana: 'おぼえれば', toKanji: '覚えれば', meaning: 'Nếu ghi nhớ' },
          ],
        },
      ],
      exceptions: {
        title: 'Mở rộng: Tính từ đuôi「い」sang thể「ば」',
        note: 'Tính từ đuôi「い」bỏ「い」thay bằng「ければ」(Ví dụ: 安い → 安ければ, 良い → 良ければ / よければ). Động từ thể phủ định「〜ない」→「〜なければ」.',
      },
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ chính:「します」(→ すれば) và「来ます」(→ 来れば / くれば).',
      rules: [
        {
          id: 'g3_jouken',
          badge: 'すれば・くれば',
          result: 'すれば・くれば',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'すれば', toKanji: 'すれば', meaning: 'Nếu làm' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうすれば', toKanji: '勉強すれば', meaning: 'Nếu học tập' },
            { fromHiragana: 'うんてんします', fromKanji: '運転します', toHiragana: 'うんてんすれば', toKanji: '運転すれば', meaning: 'Nếu lái xe' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'くれば', toKanji: '来れば', meaning: 'Nếu đến (⚠️ đọc là ku-re-ba)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Điều Kiện (ば) ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  10. THỂ BỊ ĐỘNG (PASSIVE / UKEMIKEI / 受身形) CONFIG
// ══════════════════════════════════════════════════════════════════
export const PASSIVE_FORM_CONFIG: VerbFormConfig = {
  formId: 'passive',
  jpBadge: '受身形',
  shortBadge: '受',
  title: 'Luyện chia Thể Bị Động',
  subtitle: 'Passive Form Practice',
  targetFormPrompt: 'Chia sang thể Bị Động',
  audioKeyword: 'うけみけい',
  verbs: PASSIVE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.passiveForm,
    targetFormKanji: v.passiveFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Bị Động (受身形)」',
    description: 'Thể Bị Động (受身形 — Ukemikei) dùng khi chủ ngữ chịu sự tác động bởi một đối tượng khác (được khen, bị mắng, bị phiền toái...). ⚠️ Đối tượng gây ra hành động đi với trợ từ「に」.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「あ」rồi thêm「れる」(hoặc「れます」). (⚠️「い」→「われる」)',
      rules: [
        {
          id: 'g1_wareru',
          badge: 'い → われる',
          result: 'われる',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かわれる', toKanji: '買われる', meaning: 'Bị / được mua' },
            { fromHiragana: 'さそいます', fromKanji: '誘います', toHiragana: 'さそわれる', toKanji: '誘われる', meaning: 'Được rủ rê, mời' },
            { fromHiragana: 'わらいます', fromKanji: '笑います', toHiragana: 'わらわれる', toKanji: '笑われる', meaning: 'Bị cười nhạo' },
          ],
        },
        {
          id: 'g1_kareru',
          badge: 'き → かれる',
          result: 'かれる',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かかれる', toKanji: '書かれる', meaning: 'Được viết' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きかれる', toKanji: '聞かれる', meaning: 'Bị hỏi, được nghe' },
            { fromHiragana: 'たたきます', fromKanji: '叩きます', toHiragana: 'たたかれる', toKanji: '叩かれる', meaning: 'Bị đánh, bị vỗ' },
          ],
        },
        {
          id: 'g1_gareru',
          badge: 'ぎ → がれる',
          result: 'がれる',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およがれる', toKanji: '泳がれる', meaning: 'Được bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそがれる', toKanji: '急がれる', meaning: 'Bị giục giã' },
          ],
        },
        {
          id: 'g1_sareru',
          badge: 'し → される',
          result: 'される',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなされる', toKanji: '話される', meaning: 'Được nói' },
            { fromHiragana: 'さします', fromKanji: '刺します', toHiragana: 'さされる', toKanji: '刺される', meaning: 'Bị muỗi chích / đâm' },
            { fromHiragana: 'だまします', fromKanji: '騙します', toHiragana: 'だまされる', toKanji: '騙される', meaning: 'Bị lừa gạt' },
          ],
        },
        {
          id: 'g1_tareru',
          badge: 'ち → たれる',
          result: 'たれる',
          examples: [
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'またれる', toKanji: '待たれる', meaning: 'Được đợi' },
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たたれる', toKanji: '立たれる', meaning: 'Bị đứng chắn' },
          ],
        },
        {
          id: 'g1_nareru',
          badge: 'に → なれる',
          result: 'なれる',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しなれる', toKanji: '死なれる', meaning: 'Bị mất người thân' },
          ],
        },
        {
          id: 'g1_barerua',
          badge: 'び → ばれる',
          result: 'ばれる',
          examples: [
            { fromHiragana: 'よびます', fromKanji: '呼びます', toHiragana: 'よばれる', toKanji: '呼ばれる', meaning: 'Được gọi tên' },
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそばれる', toKanji: '遊ばれる', meaning: 'Bị trêu đùa' },
          ],
        },
        {
          id: 'g1_mareru',
          badge: 'み → まれる',
          result: 'まれる',
          examples: [
            { fromHiragana: 'ふみます', fromKanji: '踏みます', toHiragana: 'ふまれる', toKanji: '踏まれる', meaning: 'Bị dẫm lên chân' },
            { fromHiragana: 'たのみます', fromKanji: '頼みます', toHiragana: 'たのまれる', toKanji: '頼まれる', meaning: 'Được nhờ vả' },
            { fromHiragana: 'ぬすみます', fromKanji: '盗みます', toHiragana: 'ぬすまれる', toKanji: '盗まれる', meaning: 'Bị trộm cắp' },
            { fromHiragana: 'かみます', fromKanji: '噛みます', toHiragana: 'かまれる', toKanji: '噛まれる', meaning: 'Bị cắn (chó cắn...)' },
          ],
        },
        {
          id: 'g1_rareru1',
          badge: 'り → られる',
          result: 'られる',
          examples: [
            { fromHiragana: 'しかります', fromKanji: '叱ります', toHiragana: 'しかられる', toKanji: '叱られる', meaning: 'Bị mắng' },
            { fromHiragana: 'とります', fromKanji: '取ります', toHiragana: 'とられる', toKanji: '取られる', meaning: 'Bị lấy mất' },
            { fromHiragana: 'ふります', fromKanji: '振ります', toHiragana: 'ふられる', toKanji: '振られる', meaning: 'Bị từ chối / bị đá' },
          ],
        },
      ],
      exceptions: {
        title: 'Bị động gián tiếp / phiền toái (迷惑の受身)',
        note: 'Trong tiếng Nhật, thể bị động còn diễn tả việc người nói gặp rắc rối, phiền toái do hành động của người khác gây ra (Ví dụ: 雨に降られた - Bị dính mưa, 赤ちゃんに泣かれた - Bị em bé khóc làm phiền).',
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「られる」(hoặc「られます」).',
      rules: [
        {
          id: 'g2_rareru',
          badge: 'ます → られる',
          result: 'られる',
          examples: [
            { fromHiragana: 'ほめます', fromKanji: '褒めます', toHiragana: 'ほめられる', toKanji: '褒められる', meaning: 'Được khen ngợi' },
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべられる', toKanji: '食べられる', meaning: 'Bị ăn mất' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みられる', toKanji: '見られる', meaning: 'Bị nhìn thấy' },
            { fromHiragana: 'すてます', fromKanji: '捨てます', toHiragana: 'すてられる', toKanji: '捨てられる', meaning: 'Bị vứt bỏ' },
            { fromHiragana: 'おしえます', fromKanji: '教えます', toHiragana: 'おしえられる', toKanji: '教えられる', meaning: 'Được chỉ dạy' },
            { fromHiragana: 'いじめます', fromKanji: '苛めます', toHiragana: 'いじめられる', toKanji: '苛められる', meaning: 'Bị bắt nạt' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ chính:「します」(→ される) và「来ます」(→ 来られる / こられる).',
      rules: [
        {
          id: 'g3_passive',
          badge: 'される・こられる',
          result: 'される・こられる',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'される', toKanji: 'される', meaning: 'Bị / được làm' },
            { fromHiragana: 'ちゅういします', fromKanji: '注意します', toHiragana: 'ちゅういされる', toKanji: '注意される', meaning: 'Bị nhắc nhở' },
            { fromHiragana: 'しょうたいします', fromKanji: '招待します', toHiragana: 'しょうたいされる', toKanji: '招待される', meaning: 'Được mời / chiêu đãi' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こられる', toKanji: '来られる', meaning: 'Bị đến (làm phiền, ⚠️ đọc là ko-ra-re-ru)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Bị Động ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  11. THỂ SAI KHIẾN (CAUSATIVE / SHIEKIKEI / 使役形) CONFIG
// ══════════════════════════════════════════════════════════════════
export const CAUSATIVE_FORM_CONFIG: VerbFormConfig = {
  formId: 'causative',
  jpBadge: '使役形',
  shortBadge: '使',
  title: 'Luyện chia Thể Sai Khiến',
  subtitle: 'Causative Form Practice',
  targetFormPrompt: 'Chia sang thể Sai Khiến',
  audioKeyword: 'しえきけい',
  verbs: CAUSATIVE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.causativeForm,
    targetFormKanji: v.causativeFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Sai Khiến (使役形)」',
    description: 'Thể Sai Khiến (使役形 — Shiekikei) dùng để diễn tả việc người trên bắt buộc hoặc cho phép người dưới thực hiện một hành động ("Bắt làm...", "Cho phép làm...").',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「あ」rồi thêm「せる」(hoặc「せます」). (⚠️「い」→「わせる」)',
      rules: [
        {
          id: 'g1_waseru',
          badge: 'い → わせる',
          result: 'わせる',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かわせる', toKanji: '買わせる', meaning: 'Bắt mua / Cho mua' },
            { fromHiragana: 'うたいます', fromKanji: '歌います', toHiragana: 'うたわせる', toKanji: '歌わせる', meaning: 'Bắt hát / Cho hát' },
            { fromHiragana: 'つかいます', fromKanji: '使います', toHiragana: 'つかわせる', toKanji: '使わせる', meaning: 'Bắt dùng / Cho dùng' },
          ],
        },
        {
          id: 'g1_kaseru',
          badge: 'き → かせる',
          result: 'かせる',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かかせる', toKanji: '書かせる', meaning: 'Bắt viết / Cho viết' },
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いかせる', toKanji: '行かせる', meaning: 'Bắt đi / Cho phép đi' },
            { fromHiragana: 'ききます', fromKanji: '聞きます', toHiragana: 'きかせる', toKanji: '聞かせる', meaning: 'Cho nghe' },
          ],
        },
        {
          id: 'g1_gaseru',
          badge: 'ぎ → がせる',
          result: 'がせる',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およがせる', toKanji: '泳がせる', meaning: 'Bắt bơi / Cho bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそがせる', toKanji: '急がせる', meaning: 'Thúc giục / Bắt vội' },
          ],
        },
        {
          id: 'g1_saseru1',
          badge: 'し → させる',
          result: 'させる',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなさせる', toKanji: '話させる', meaning: 'Bắt nói / Cho nói' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'ださせる', toKanji: '出させる', meaning: 'Bắt đưa ra / Bắt nộp' },
          ],
        },
        {
          id: 'g1_taseru',
          badge: 'ち → たせる',
          result: 'たせる',
          examples: [
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'またせる', toKanji: '待たせる', meaning: 'Bắt đợi / Để ai đợi' },
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たたせる', toKanji: '立たせる', meaning: 'Bắt đứng dậy' },
          ],
        },
        {
          id: 'g1_naseru',
          badge: 'に → なせる',
          result: 'なせる',
          examples: [
            { fromHiragana: 'しにます', fromKanji: '死にます', toHiragana: 'しなせる', toKanji: '死なせる', meaning: 'Để cho chết' },
          ],
        },
        {
          id: 'g1_baseru',
          badge: 'び → ばせる',
          result: 'ばせる',
          examples: [
            { fromHiragana: 'あそびます', fromKanji: '遊びます', toHiragana: 'あそばせる', toKanji: '遊ばせる', meaning: 'Cho phép vui chơi' },
            { fromHiragana: 'よびます', fromKanji: '呼びます', toHiragana: 'よばせる', toKanji: '呼ばせる', meaning: 'Sai gọi đến' },
          ],
        },
        {
          id: 'g1_maseru',
          badge: 'み → ませる',
          result: 'ませる',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のませる', toKanji: '飲ませる', meaning: 'Cho uống / Bắt uống' },
            { fromHiragana: 'よみます', fromKanji: '読みます', toHiragana: 'よませる', toKanji: '読ませる', meaning: 'Bắt đọc' },
            { fromHiragana: 'やすみます', fromKanji: '休みます', toHiragana: 'やすませる', toKanji: '休ませる', meaning: 'Cho nghỉ' },
          ],
        },
        {
          id: 'g1_raseru',
          badge: 'り → らせる',
          result: 'らせる',
          examples: [
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくらせる', toKanji: '作らせる', meaning: 'Bắt làm / Sai nấu' },
            { fromHiragana: 'はしります', fromKanji: '走ります', toHiragana: 'はしらせる', toKanji: '走らせる', meaning: 'Bắt chạy' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえらせる', toKanji: '帰らせる', meaning: 'Cho về / Bắt về' },
          ],
        },
      ],
      exceptions: {
        title: 'Mẫu câu xin phép lịch sự: 〜させてください / させていただけませんか',
        note: 'Khi muốn xin phép đối phương cho mình làm điều gì một cách lịch sự, người Nhật dùng thể sai khiến + てください (Ví dụ: 少し休ませてください - Xin hãy cho tôi nghỉ một chút).',
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「させる」(hoặc「させます」).',
      rules: [
        {
          id: 'g2_saseru',
          badge: 'ます → させる',
          result: 'させる',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべさせる', toKanji: '食べさせる', meaning: 'Cho ăn / Bắt ăn hết' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みさせる', toKanji: '見させる', meaning: 'Cho xem / Bắt nhìn' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきさせる', toKanji: '起きさせる', meaning: 'Bắt thức dậy' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねさせる', toKanji: '寝させる', meaning: 'Cho đi ngủ' },
            { fromHiragana: 'あけます', fromKanji: '開けます', toHiragana: 'あけさせる', toKanji: '開けさせる', meaning: 'Bắt mở' },
            { fromHiragana: 'おぼえます', fromKanji: '覚えます', toHiragana: 'おぼえさせる', toKanji: '覚えさせる', meaning: 'Bắt học thuộc' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ chính:「します」(→ させる) và「来ます」(→ 来させる / こさせる).',
      rules: [
        {
          id: 'g3_causative',
          badge: 'させる・こさせる',
          result: 'させる・こさせる',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'させる', toKanji: 'させる', meaning: 'Bắt làm / Cho làm' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうさせる', toKanji: '勉強させる', meaning: 'Bắt học bài' },
            { fromHiragana: 'そうじします', fromKanji: '掃除します', toHiragana: 'そうじさせる', toKanji: '掃除させる', meaning: 'Bắt dọn dẹp' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こさせる', toKanji: '来させる', meaning: 'Bắt đến / Cho đến (⚠️ đọc là ko-sa-se-ru)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Sai Khiến ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

// ══════════════════════════════════════════════════════════════════
//  12. THỂ SAI KHIẾN BỊ ĐỘNG (CAUSATIVE-PASSIVE / SHIEKI UKEMI / 使役受身形) CONFIG
// ══════════════════════════════════════════════════════════════════
export const CAUSATIVE_PASSIVE_FORM_CONFIG: VerbFormConfig = {
  formId: 'causative-passive',
  jpBadge: '使役受身形',
  shortBadge: '使受',
  title: 'Luyện chia Thể Sai Khiến Bị Động',
  subtitle: 'Causative-Passive Form Practice',
  targetFormPrompt: 'Chia sang thể Sai Khiến Bị Động',
  audioKeyword: 'しえきうけみけい',
  verbs: CAUSATIVE_PASSIVE_FORM_VERBS.map((v) => ({
    id: v.id,
    kanji: v.kanji,
    hiragana: v.hiragana,
    targetForm: v.causativePassiveForm,
    targetFormKanji: v.causativePassiveFormKanji,
    meaning: v.meaning,
    hanViet: v.hanViet,
    group: v.group,
    endingBefore: v.endingBefore,
    rule: v.rule,
  })),
  theory: {
    title: 'Cách chia động từ sang thể「Sai Khiến Bị Động (使役受身形)」',
    description: 'Thể Sai Khiến Bị Động (使役受身形 — Shieki Ukemikei) diễn tả việc chủ ngữ bị người khác ép buộc, bắt buộc phải làm một việc gì đó ngoài ý muốn ("Bị bắt làm...", "Phải làm..."). ⚠️ Người ép buộc đi với trợ từ「に」.',
    group1: {
      introTitle: 'Nhóm 1 — Động từ 五段 (Godan)',
      introDesc: 'Quy tắc: Chuyển âm đứng trước「ます」từ cột「い」sang cột「あ」rồi thêm「される」(Dạng rút gọn thông dụng). (⚠️「い」→「わされる」).',
      rules: [
        {
          id: 'g1_wasareru',
          badge: 'い → わされる',
          result: 'わされる',
          examples: [
            { fromHiragana: 'かいます', fromKanji: '買います', toHiragana: 'かわされる', toKanji: '買わされる', meaning: 'Bị ép mua' },
            { fromHiragana: 'うたいます', fromKanji: '歌います', toHiragana: 'うたわされる', toKanji: '歌わされる', meaning: 'Bị bắt hát' },
            { fromHiragana: 'はらいます', fromKanji: '払います', toHiragana: 'はらわされる', toKanji: '払わされる', meaning: 'Bị ép trả tiền' },
          ],
        },
        {
          id: 'g1_kasareru',
          badge: 'き → かされる',
          result: 'かされる',
          examples: [
            { fromHiragana: 'かきます', fromKanji: '書きます', toHiragana: 'かかされる', toKanji: '書かされる', meaning: 'Bị bắt viết (bản kiểm điểm...)' },
            { fromHiragana: 'いきます', fromKanji: '行きます', toHiragana: 'いかされる', toKanji: '行かされる', meaning: 'Bị bắt đi' },
            { fromHiragana: 'はたらきます', fromKanji: '働きます', toHiragana: 'はたらかされる', toKanji: '働かされる', meaning: 'Bị bắt làm việc quá sức' },
          ],
        },
        {
          id: 'g1_gasareru',
          badge: 'ぎ → がされる',
          result: 'がされる',
          examples: [
            { fromHiragana: 'およぎます', fromKanji: '泳ぎます', toHiragana: 'およがされる', toKanji: '泳がされる', meaning: 'Bị bắt bơi' },
            { fromHiragana: 'いそぎます', fromKanji: '急ぎます', toHiragana: 'いそがされる', toKanji: '急がされる', meaning: 'Bị thúc ép vội vàng' },
          ],
        },
        {
          id: 'g1_saserareru',
          badge: 'し → させられる',
          result: 'させられる',
          examples: [
            { fromHiragana: 'はなします', fromKanji: '話します', toHiragana: 'はなさせられる', toKanji: '話させられる', meaning: 'Bị bắt khai / nói (⚠️ không rút gọn)' },
            { fromHiragana: 'だします', fromKanji: '出します', toHiragana: 'ださせられる', toKanji: '出させられる', meaning: 'Bị bắt nộp ra' },
          ],
        },
        {
          id: 'g1_tasareru',
          badge: 'ち → たされる',
          result: 'たされる',
          examples: [
            { fromHiragana: 'まちます', fromKanji: '待ちます', toHiragana: 'またされる', toKanji: '待たされる', meaning: 'Bị bắt chờ đợi lâu' },
            { fromHiragana: 'たちます', fromKanji: '立ちます', toHiragana: 'たたされる', toKanji: '立たされる', meaning: 'Bị phạt đứng' },
          ],
        },
        {
          id: 'g1_masareru',
          badge: 'み → まされる',
          result: 'まされる',
          examples: [
            { fromHiragana: 'のみます', fromKanji: '飲みます', toHiragana: 'のまされる', toKanji: '飲まされる', meaning: 'Bị ép uống rượu' },
            { fromHiragana: 'よみます', fromKanji: '読みます', toHiragana: 'よまされる', toKanji: '読まされる', meaning: 'Bị bắt đọc sách' },
          ],
        },
        {
          id: 'g1_rasareru',
          badge: 'り → らされる',
          result: 'らされる',
          examples: [
            { fromHiragana: 'はしります', fromKanji: '走ります', toHiragana: 'はしらされる', toKanji: '走らされる', meaning: 'Bị bắt chạy bộ' },
            { fromHiragana: 'つくります', fromKanji: '作ります', toHiragana: 'つくらされる', toKanji: '作らされる', meaning: 'Bị bắt làm' },
            { fromHiragana: 'かえります', fromKanji: '帰ります', toHiragana: 'かえらされる', toKanji: '帰らされる', meaning: 'Bị bắt quay về' },
          ],
        },
      ],
      exceptions: {
        title: 'Lưu ý đuôi「し」ở Nhóm 1 không có dạng rút gọn',
        note: 'Các động từ kết thúc bằng「し」(như 話します, 出します...) chỉ có dạng dài là「〜させられる」(話させられる), không biến đổi thành「〜さされる」để tránh trùng lặp âm.',
      },
    },
    group2: {
      introTitle: 'Nhóm 2 — Động từ 一段 (Ichidan)',
      introDesc: 'Quy tắc: Bỏ「ます」, thêm trực tiếp「させられる」(không có dạng rút gọn).',
      rules: [
        {
          id: 'g2_saserareru',
          badge: 'ます → させられる',
          result: 'させられる',
          examples: [
            { fromHiragana: 'たべます', fromKanji: '食べます', toHiragana: 'たべさせられる', toKanji: '食べさせられる', meaning: 'Bị bắt ăn (rau, ớt...)' },
            { fromHiragana: 'みます', fromKanji: '見ます', toHiragana: 'みさせられる', toKanji: '見させられる', meaning: 'Bị bắt xem' },
            { fromHiragana: 'おきます', fromKanji: '起きます', toHiragana: 'おきさせられる', toKanji: '起きさせられる', meaning: 'Bị bắt dậy sớm' },
            { fromHiragana: 'ねます', fromKanji: '寝ます', toHiragana: 'ねさせられる', toKanji: '寝させられる', meaning: 'Bị bắt đi ngủ' },
            { fromHiragana: 'おぼえます', fromKanji: '覚えます', toHiragana: 'おぼえさせられる', toKanji: '覚えさせられる', meaning: 'Bị bắt học thuộc' },
          ],
        },
      ],
    },
    group3: {
      introTitle: 'Nhóm 3 — Động từ bất quy tắc (不規則動詞)',
      introDesc: 'Chỉ có 2 động từ chính:「します」(→ させられる) và「来ます」(→ 来させられる / こさせられる).',
      rules: [
        {
          id: 'g3_causative_passive',
          badge: 'させられる・こさせられる',
          result: 'させられる・こさせられる',
          examples: [
            { fromHiragana: 'します', fromKanji: 'します', toHiragana: 'させられる', toKanji: 'させられる', meaning: 'Bị bắt làm' },
            { fromHiragana: 'べんきょうします', fromKanji: '勉強します', toHiragana: 'べんきょうさせられる', toKanji: '勉強させられる', meaning: 'Bị bắt học bài' },
            { fromHiragana: 'そうじします', fromKanji: '掃除します', toHiragana: 'そうじさせられる', toKanji: '掃除させられる', meaning: 'Bị phạt dọn dẹp' },
            { fromHiragana: 'きます', fromKanji: '来ます', toHiragana: 'こさせられる', toKanji: '来させられる', meaning: 'Bị bắt đến (⚠️ đọc là ko-sa-se-ra-re-ru)' },
          ],
        },
      ],
    },
    bottomCtaTitle: 'Bắt đầu luyện tập chia Thể Sai Khiến Bị Động ngay',
    bottomCtaDesc: 'Thực hành trắc nghiệm, ghép từ và bàn phím Hiragana để rèn luyện phản xạ chia thể nhanh và chính xác.',
  },
};

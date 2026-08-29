// ============================================================
//  UNIFIED VERB FORM ARENA — DATA MODELS & INTERFACES
// ============================================================

export interface ConjugationVerb {
  id: string;
  kanji: string;
  hiragana: string;
  targetForm: string; // Dạng biến đổi hiragana (e.g. かって, かった, かわない, かう, かおう)
  targetFormKanji: string; // Dạng biến đổi kanji (e.g. 買って, 買った, 買わない, 買う, 買おう)
  meaning: string; // Nghĩa tiếng Việt
  hanViet?: string; // Âm Hán Việt
  group: 1 | 2 | 3; // Nhóm động từ (1, 2, hoặc 3)
  endingBefore: string; // Ký tự trước ます (e.g. 'い', 'き', 'し', 'ち', 'り'...)
  rule: string; // Mã quy tắc chia
  exampleSentence?: string; // Mẫu câu ví dụ (tùy chọn)
  exampleMeaning?: string; // Nghĩa mẫu câu (tùy chọn)
}

export interface TheoryRuleExample {
  fromHiragana: string;
  fromKanji: string;
  toHiragana: string;
  toKanji: string;
  meaning: string;
  note?: string;
}

export interface TheoryRuleCard {
  id: string;
  badge: string; // e.g. 'い・ち・り', 'き', 'ます', 'します'
  arrow?: string; // e.g. '→'
  result: string; // e.g. 'って', 'った', 'わない', 'う', 'おう'
  description?: string; // e.g. 'Bỏ「ます」, thay bằng「って」'
  examples: TheoryRuleExample[];
}

export interface TheoryGroupConfig {
  introTitle: string; // e.g. 'Nhóm 1 — Động từ 五段 (Godan)'
  introDesc: string; // e.g. 'Âm trước「ます」thuộc cột「い」(い段)...'
  rules: TheoryRuleCard[];
  exceptions?: {
    title: string;
    note?: string;
    examples?: TheoryRuleExample[];
  };
}

export interface VerbFormConfig {
  formId: string; // 'te' | 'ta' | 'nai' | 'ru' | 'volitional' | 'potential' ...
  jpBadge: string; // 'て形', 'た形', 'ない形', '辞書', '意向'
  shortBadge: string; // 'て', 'た', 'な', 'る', '意'
  title: string; // 'Luyện chia thể て'
  subtitle: string; // 'Te-form Practice'
  targetFormPrompt: string; // 'Chia sang thể て'
  audioKeyword: string; // 'てけい'
  verbs: ConjugationVerb[];
  theory: {
    title: string; // 'Cách chia động từ sang thể「て」'
    description: string; // 'Thể「て」hoặc「で」là dạng chia động từ cơ bản...'
    group1: TheoryGroupConfig;
    group2: TheoryGroupConfig;
    group3: TheoryGroupConfig;
    bottomCtaTitle?: string;
    bottomCtaDesc?: string;
  };
}

export interface VerbFormQuickLink {
  id: string;
  label: string;
  jpBadge: string;
  level: 'N5' | 'N4';
  formula: string;
  route: string;
}

export const ALL_VERB_FORM_LINKS: VerbFormQuickLink[] = [
  { id: 'te', label: 'Thể て (て形)', jpBadge: 'て', level: 'N5', formula: '〜て / 〜で', route: '/luyen-the-te' },
  { id: 'ta', label: 'Thể Quá khứ (た)', jpBadge: 'た', level: 'N5', formula: '〜た / 〜だ', route: '/luyen-the-ta' },
  { id: 'nai', label: 'Thể Phủ định (ない)', jpBadge: 'な', level: 'N5', formula: '〜あ + ない', route: '/luyen-the-nai' },
  { id: 'ru', label: 'Thể Từ điển (る)', jpBadge: 'る', level: 'N5', formula: '〜う / 〜る', route: '/luyen-the-ru' },
  { id: 'volitional', label: 'Thể Ý chí (よう)', jpBadge: 'よ', level: 'N5', formula: '〜おう / 〜よう', route: '/luyen-the-y-chi' },
  { id: 'imperative', label: 'Thể Mệnh lệnh (命令形)', jpBadge: '令', level: 'N4', formula: '〜え / 〜ろ', route: '/luyen-the-menh-lenh' },
  { id: 'prohibitive', label: 'Thể Cấm chỉ (禁止形)', jpBadge: '禁', level: 'N4', formula: '辞書形 + な', route: '/luyen-the-cam-chi' },
  { id: 'potential', label: 'Thể Khả năng (可能形)', jpBadge: '能', level: 'N4', formula: '〜える / 〜られる', route: '/luyen-the-kha-nang' },
  { id: 'conditional', label: 'Thể Điều kiện (ば)', jpBadge: '条', level: 'N4', formula: '〜えば / 〜れば', route: '/luyen-the-dieu-kien' },
  { id: 'passive', label: 'Thể Bị động (受身形)', jpBadge: '受', level: 'N4', formula: '〜あれる / 〜られる', route: '/luyen-the-bi-dong' },
  { id: 'causative', label: 'Thể Sai khiến (使役形)', jpBadge: '使', level: 'N4', formula: '〜あせる / 〜させる', route: '/luyen-the-sai-khien' },
  { id: 'causative-passive', label: 'Thể Sai khiến bị động (使役受身)', jpBadge: '使受', level: 'N4', formula: '〜あされる / 〜させられる', route: '/luyen-the-sai-khien-bi-dong' },
];

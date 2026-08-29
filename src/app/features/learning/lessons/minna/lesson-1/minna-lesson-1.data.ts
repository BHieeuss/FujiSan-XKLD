export type VocabularyCategory = 'people' | 'jobs' | 'places' | 'expressions';

export interface VocabularyItem {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  category: VocabularyCategory;
  note?: string;
  audioSrc?: string;
}

export interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  usage: string;
  examples: Array<{ japanese: string; vietnamese: string }>;
  caution?: string;
}

export const VOCABULARY_CATEGORY_LABELS: Record<VocabularyCategory, string> = {
  people: 'Con người',
  jobs: 'Nghề nghiệp',
  places: 'Tổ chức & nơi chốn',
  expressions: 'Giao tiếp',
};

export const LESSON_1_VOCABULARY: VocabularyItem[] = [
  { id: 'watashi', japanese: '私', reading: 'わたし', meaning: 'tôi', category: 'people' },
  {
    id: 'watashitachi',
    japanese: '私たち',
    reading: 'わたしたち',
    meaning: 'chúng tôi, chúng ta',
    category: 'people',
  },
  { id: 'anata', japanese: 'あなた', reading: 'あなた', meaning: 'bạn', category: 'people' },
  {
    id: 'ano-hito',
    japanese: 'あの人',
    reading: 'あのひと',
    meaning: 'người kia',
    category: 'people',
  },
  {
    id: 'ano-kata',
    japanese: 'あの方',
    reading: 'あのかた',
    meaning: 'vị kia',
    category: 'people',
    note: 'Cách nói lịch sự của あのひと.',
  },
  {
    id: 'minasan',
    japanese: '皆さん',
    reading: 'みなさん',
    meaning: 'mọi người',
    category: 'people',
  },
  {
    id: 'san',
    japanese: '～さん',
    reading: '～さん',
    meaning: 'anh, chị, ông, bà...',
    category: 'people',
    note: 'Đặt sau tên người khác; không dùng với tên mình.',
  },
  {
    id: 'sensei',
    japanese: '先生',
    reading: 'せんせい',
    meaning: 'thầy, cô; bác sĩ; người có chuyên môn',
    category: 'jobs',
    note: 'Dùng để gọi hoặc nói về người khác.',
  },
  {
    id: 'kyoushi',
    japanese: '教師',
    reading: 'きょうし',
    meaning: 'giáo viên',
    category: 'jobs',
    note: 'Thường dùng khi tự nói nghề nghiệp của mình.',
  },
  {
    id: 'gakusei',
    japanese: '学生',
    reading: 'がくせい',
    meaning: 'học sinh, sinh viên',
    category: 'jobs',
  },
  {
    id: 'kaishain',
    japanese: '会社員',
    reading: 'かいしゃいん',
    meaning: 'nhân viên công ty',
    category: 'jobs',
  },
  {
    id: 'shain',
    japanese: '社員',
    reading: 'しゃいん',
    meaning: 'nhân viên của một công ty cụ thể',
    category: 'jobs',
    note: 'Ví dụ: VieJapの しゃいん.',
  },
  {
    id: 'ginkouin',
    japanese: '銀行員',
    reading: 'ぎんこういん',
    meaning: 'nhân viên ngân hàng',
    category: 'jobs',
  },
  { id: 'isha', japanese: '医者', reading: 'いしゃ', meaning: 'bác sĩ', category: 'jobs' },
  {
    id: 'kenkyuusha',
    japanese: '研究者',
    reading: 'けんきゅうしゃ',
    meaning: 'nhà nghiên cứu',
    category: 'jobs',
  },
  {
    id: 'engineer',
    japanese: 'エンジニア',
    reading: 'エンジニア',
    meaning: 'kỹ sư',
    category: 'jobs',
  },
  {
    id: 'daigaku',
    japanese: '大学',
    reading: 'だいがく',
    meaning: 'trường đại học',
    category: 'places',
  },
  {
    id: 'byouin',
    japanese: '病院',
    reading: 'びょういん',
    meaning: 'bệnh viện',
    category: 'places',
  },
  {
    id: 'dare',
    japanese: '誰',
    reading: 'だれ',
    meaning: 'ai',
    category: 'expressions',
  },
  {
    id: 'donata',
    japanese: 'どなた',
    reading: 'どなた',
    meaning: 'vị nào, ai',
    category: 'expressions',
    note: 'Cách hỏi lịch sự của だれ.',
  },
  {
    id: 'nansai',
    japanese: '何歳',
    reading: 'なんさい',
    meaning: 'bao nhiêu tuổi',
    category: 'expressions',
  },
  {
    id: 'oikutsu',
    japanese: 'おいくつ',
    reading: 'おいくつ',
    meaning: 'bao nhiêu tuổi',
    category: 'expressions',
    note: 'Cách hỏi lịch sự.',
  },
  {
    id: 'hajimemashite',
    japanese: '初めまして',
    reading: 'はじめまして',
    meaning: 'rất vui được gặp bạn',
    category: 'expressions',
  },
  {
    id: 'yoroshiku',
    japanese: 'どうぞよろしくお願いします',
    reading: 'どうぞ よろしく おねがいします',
    meaning: 'mong được giúp đỡ; rất mong được làm quen',
    category: 'expressions',
  },
  {
    id: 'shitsurei',
    japanese: '失礼ですが',
    reading: 'しつれいですが',
    meaning: 'xin lỗi, cho phép tôi hỏi...',
    category: 'expressions',
  },
  {
    id: 'onamae',
    japanese: 'お名前は？',
    reading: 'おなまえは？',
    meaning: 'bạn tên là gì?',
    category: 'expressions',
  },
  {
    id: 'kochira',
    japanese: 'こちらは～さんです',
    reading: 'こちらは～さんです',
    meaning: 'đây là anh/chị...',
    category: 'expressions',
  },
];

export const LESSON_1_GRAMMAR: GrammarPoint[] = [
  {
    id: 'wa-desu',
    pattern: 'N1 は N2 です',
    meaning: 'N1 là N2',
    usage: 'は nêu chủ đề; です kết thúc câu lịch sự và đưa ra thông tin về chủ đề đó.',
    examples: [
      { japanese: 'わたしは リンです。', vietnamese: 'Tôi là Linh.' },
      { japanese: 'ミンさんは がくせいです。', vietnamese: 'Anh Minh là sinh viên.' },
    ],
    caution: 'Trợ từ は trong mẫu này được đọc là わ.',
  },
  {
    id: 'negative',
    pattern: 'N1 は N2 じゃありません',
    meaning: 'N1 không phải là N2',
    usage: 'Dùng để phủ định danh từ. ではありません trang trọng hơn じゃありません.',
    examples: [
      { japanese: 'わたしは せんせいじゃありません。', vietnamese: 'Tôi không phải giáo viên.' },
      { japanese: 'アンさんは いしゃではありません。', vietnamese: 'Chị An không phải bác sĩ.' },
    ],
  },
  {
    id: 'question',
    pattern: 'N1 は N2 ですか',
    meaning: 'N1 có phải là N2 không?',
    usage: 'Thêm か ở cuối câu để tạo câu hỏi. Trả lời bằng はい hoặc いいえ.',
    examples: [
      { japanese: 'ミラーさんは かいしゃいんですか。', vietnamese: 'Anh Miller là nhân viên công ty phải không?' },
      { japanese: 'はい、かいしゃいんです。', vietnamese: 'Vâng, tôi là nhân viên công ty.' },
    ],
  },
  {
    id: 'mo',
    pattern: 'N1 も N2 です',
    meaning: 'N1 cũng là N2',
    usage: 'も thay cho は khi thông tin về N1 giống đối tượng đã nói trước đó.',
    examples: [
      { japanese: 'わたしは ベトナムじんです。リンさんも ベトナムじんです。', vietnamese: 'Tôi là người Việt Nam. Linh cũng là người Việt Nam.' },
    ],
  },
  {
    id: 'no',
    pattern: 'N1 の N2',
    meaning: 'N2 thuộc về hoặc có quan hệ với N1',
    usage: 'の nối hai danh từ, thường biểu thị sở hữu, nơi làm việc, quốc tịch hoặc lĩnh vực.',
    examples: [
      { japanese: 'VieJapの しゃいんです。', vietnamese: 'Tôi là nhân viên của VieJap.' },
      { japanese: 'にほんごの せんせいです。', vietnamese: 'Là giáo viên tiếng Nhật.' },
    ],
  },
];

export const READING_PASSAGE = {
  title: 'はじめまして',
  japanese:
    'はじめまして。わたしは グエン・アンです。ベトナムじんです。VieJapの がくせいです。24さいです。せんせいは たなかせんせいです。どうぞ よろしく おねがいします。',
  vietnamese:
    'Rất vui được gặp bạn. Tôi là Nguyễn An. Tôi là người Việt Nam và là học viên của VieJap. Tôi 24 tuổi. Giáo viên của tôi là cô Tanaka. Rất mong được giúp đỡ.',
  questions: [
    {
      id: 'reading-name',
      prompt: 'Người viết tên là gì?',
      options: ['Nguyễn An', 'Tanaka', 'VieJap'],
      answer: 'Nguyễn An',
    },
    {
      id: 'reading-role',
      prompt: 'Nguyễn An là ai?',
      options: ['Giáo viên', 'Học viên VieJap', 'Bác sĩ'],
      answer: 'Học viên VieJap',
    },
    {
      id: 'reading-age',
      prompt: 'Nguyễn An bao nhiêu tuổi?',
      options: ['20 tuổi', '24 tuổi', '27 tuổi'],
      answer: '24 tuổi',
    },
  ],
};

export const LISTENING_DIALOGUE = [
  { speaker: 'A', text: 'はじめまして。わたしは リンです。ベトナムじんです。かいしゃいんです。' },
  { speaker: 'B', text: 'はじめまして。たなかです。にほんじんです。わたしも かいしゃいんです。' },
  { speaker: 'A', text: 'たなかさんは VieJapの しゃいんですか。' },
  { speaker: 'B', text: 'いいえ、VieJapの しゃいんじゃありません。ABCの しゃいんです。' },
  { speaker: 'A', text: 'そうですか。どうぞ よろしく おねがいします。' },
  { speaker: 'B', text: 'こちらこそ よろしく おねがいします。' },
];

export const LISTENING_QUESTIONS = [
  {
    id: 'listening-nationality',
    prompt: 'Linh là người nước nào?',
    options: ['Việt Nam', 'Nhật Bản', 'Thái Lan'],
    answer: 'Việt Nam',
  },
  {
    id: 'listening-job',
    prompt: 'Hai người có điểm gì giống nhau?',
    options: ['Đều là giáo viên', 'Đều là nhân viên công ty', 'Đều là sinh viên'],
    answer: 'Đều là nhân viên công ty',
  },
  {
    id: 'listening-company',
    prompt: 'Anh Tanaka làm việc ở đâu?',
    options: ['VieJap', 'ABC', 'Một trường đại học'],
    answer: 'ABC',
  },
];

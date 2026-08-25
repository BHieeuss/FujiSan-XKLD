import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface VerbFormHubItem {
  id: string;
  jpBadge: string;
  level: 'N5' | 'N4';
  title: string;
  subtitle: string;
  jpTitle: string;
  formula: string;
  description: string;
  examples: { from: string; to: string }[];
  route: string;
  gradientClass: string;
  accentColor: string;
}

@Component({
  selector: 'app-practice-hub-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './practice-hub-page.html',
  styleUrls: ['./practice-hub-page.scss'],
})
export class PracticeHubPage {
  activeFilter: 'all' | 'N5' | 'N4' = 'all';

  readonly verbForms: VerbFormHubItem[] = [
    // ── N5 CƠ BẢN ──────────────────────────────────────────────
    {
      id: 'te',
      jpBadge: 'て',
      level: 'N5',
      title: 'Thể て (て形)',
      subtitle: 'Nối câu, sai khiến nhẹ nhàng, đang làm (~ています)',
      jpTitle: 'て形',
      formula: '〜て / 〜で',
      description: 'Thể cơ bản và quan trọng nhất, dùng để liên kết hành động, nhờ vả lịch sự (~てください) và diễn tả hành động đang tiếp diễn.',
      examples: [
        { from: '食べます', to: '食べて' },
        { from: '行きます', to: '行って' },
        { from: '飲みます', to: '飲んで' },
      ],
      route: '/luyen-the-te',
      gradientClass: 'grad-te',
      accentColor: '#2563eb',
    },
    {
      id: 'ta',
      jpBadge: 'た',
      level: 'N5',
      title: 'Thể Quá Khứ (た)',
      subtitle: 'Hành động đã qua, từng có kinh nghiệm (~たことがある)',
      jpTitle: 'た形',
      formula: '〜た / 〜だ',
      description: 'Dạng quá khứ thông thường (ngắn gọn), dùng trong văn nói thân mật, cấu trúc liệt kê (~たり~たり) và kể về trải nghiệm trong quá khứ.',
      examples: [
        { from: '買います', to: '買った' },
        { from: '見ます', to: '見た' },
        { from: 'します', to: 'した' },
      ],
      route: '/luyen-the-ta',
      gradientClass: 'grad-ta',
      accentColor: '#059669',
    },
    {
      id: 'nai',
      jpBadge: 'な',
      level: 'N5',
      title: 'Thể Phủ Định (ない)',
      subtitle: 'Không làm gì đó, xin đừng (~ないでください)',
      jpTitle: 'ない形',
      formula: '〜あ + ない / 〜ない',
      description: 'Dạng phủ định thông thường (thay thế cho 〜ません), dùng khi giao tiếp thân mật, khuyên ngăn (~ないで) và bắt buộc (~なければならない).',
      examples: [
        { from: '書きます', to: '書かない' },
        { from: '食べます', to: '食べない' },
        { from: '来ます', to: 'こない' },
      ],
      route: '/luyen-the-nai',
      gradientClass: 'grad-nai',
      accentColor: '#dc2626',
    },
    {
      id: 'ru',
      jpBadge: 'る',
      level: 'N5',
      title: 'Thể Từ Điển (辞書形)',
      subtitle: 'Dạng nguyên bản tra từ điển, có thể làm (~ことができる)',
      jpTitle: '辞書形',
      formula: '〜う / 〜る',
      description: 'Thể nguyên mẫu tra cứu trong từ điển, dùng để diễn đạt sở thích, khả năng (~ことができる) và mốc thời gian trước khi làm (~まえに).',
      examples: [
        { from: '話します', to: '話す' },
        { from: '見ます', to: '見る' },
        { from: 'します', to: 'する' },
      ],
      route: '/luyen-the-ru',
      gradientClass: 'grad-ru',
      accentColor: '#7c3aed',
    },
    {
      id: 'volitional',
      jpBadge: 'よ',
      level: 'N5',
      title: 'Thể Ý Chí (よう)',
      subtitle: 'Rủ rê, đề nghị thân mật, dự định (~と思っています)',
      jpTitle: '意向形',
      formula: '〜おう / 〜よう',
      description: 'Dạng thân mật của 〜ましょう, dùng để rủ rê bạn bè, tự nhủ quyết tâm hoặc bày tỏ kế hoạch, dự định ấp ủ trong lòng.',
      examples: [
        { from: '行きます', to: '行こう' },
        { from: '食べます', to: '食べよう' },
        { from: '来ます', to: 'こよう' },
      ],
      route: '/luyen-the-y-chi',
      gradientClass: 'grad-volitional',
      accentColor: '#d97706',
    },

    // ── N4 NÂNG CAO ───────────────────────────────────────────
    {
      id: 'imperative',
      jpBadge: '令',
      level: 'N4',
      title: 'Thể Mệnh Lệnh (命令形)',
      subtitle: 'Ra lệnh dứt khoát, khẩu lệnh khẩn cấp, cổ vũ thể thao',
      jpTitle: '命令形',
      formula: '〜え / 〜ろ',
      description: 'Dùng để ra lệnh trực tiếp, hô hào cổ vũ trong thể thao (頑張れ!) hoặc hướng dẫn sơ tán, tín hiệu giao thông khẩn cấp.',
      examples: [
        { from: '走ります', to: '走れ' },
        { from: '止めます', to: '止めろ' },
        { from: 'します', to: 'しろ' },
      ],
      route: '/luyen-the-menh-lenh',
      gradientClass: 'grad-imperative',
      accentColor: '#ea580c',
    },
    {
      id: 'prohibitive',
      jpBadge: '禁',
      level: 'N4',
      title: 'Thể Cấm Chỉ (禁止形 / な)',
      subtitle: 'Nghiêm cấm tuyệt đối ("Cấm không được..."), biển báo',
      jpTitle: '禁止形',
      formula: '辞書形 + な',
      description: 'Công thức siêu ngắn [Thể Từ Điển + な] dùng trên các biển báo cấm công cộng (駐車するな - Cấm đỗ xe) hoặc khẩu lệnh cấm kỵ.',
      examples: [
        { from: '入ります', to: '入るな' },
        { from: '捨てます', to: '捨てるな' },
        { from: 'します', to: 'するな' },
      ],
      route: '/luyen-the-cam-chi',
      gradientClass: 'grad-prohibitive',
      accentColor: '#b91c1c',
    },
    {
      id: 'potential',
      jpBadge: '能',
      level: 'N4',
      title: 'Thể Khả Năng (可能形)',
      subtitle: 'Có thể làm gì đó, năng lực bản thân (~を chuyển thành ~が)',
      jpTitle: '可能形',
      formula: '〜える / 〜られる',
      description: 'Biểu thị khả năng hoặc điều kiện cho phép thực hiện hành động ("Có thể nói tiếng Nhật", "Có thể ăn món cay"). Trợ từ tân ngữ đổi thành が.',
      examples: [
        { from: '話します', to: '話せる' },
        { from: '食べます', to: '食べられる' },
        { from: 'します', to: 'できる' },
      ],
      route: '/luyen-the-kha-nang',
      gradientClass: 'grad-potential',
      accentColor: '#0284c7',
    },
    {
      id: 'conditional',
      jpBadge: '条',
      level: 'N4',
      title: 'Thể Điều Kiện (条件形 / ば)',
      subtitle: 'Giả định điều kiện ("Nếu... thì..."), đưa ra lời khuyên',
      jpTitle: '条件形',
      formula: '〜えば / 〜れば',
      description: 'Biểu thị điều kiện cần thiết để kết quả xảy ra ("Nếu giá rẻ thì tôi sẽ mua", "Nếu đi bằng tàu điện thì mất 15 phút").',
      examples: [
        { from: '買います', to: '買えば' },
        { from: '見ます', to: '見れば' },
        { from: '来ます', to: 'くれば' },
      ],
      route: '/luyen-the-dieu-kien',
      gradientClass: 'grad-conditional',
      accentColor: '#0d9488',
    },
    {
      id: 'passive',
      jpBadge: '受',
      level: 'N4',
      title: 'Thể Bị Động (受身形)',
      subtitle: 'Bị / được tác động, bị phiền toái (Người tác động đi với に)',
      jpTitle: '受身形',
      formula: '〜あれる / 〜られる',
      description: 'Diễn tả chủ ngữ được khen ngợi, bị mắng mỏ hoặc gặp phiền hà do hành động của người khác/mưa gió gây ra (迷惑の受身).',
      examples: [
        { from: '褒めます', to: '褒められる' },
        { from: '叱ります', to: '叱られる' },
        { from: 'します', to: 'される' },
      ],
      route: '/luyen-the-bi-dong',
      gradientClass: 'grad-passive',
      accentColor: '#4f46e5',
    },
    {
      id: 'causative',
      jpBadge: '使',
      level: 'N4',
      title: 'Thể Sai Khiến (使役形)',
      subtitle: 'Bắt làm / Cho phép làm, xin phép (~させてください)',
      jpTitle: '使役形',
      formula: '〜あせる / 〜させる',
      description: 'Người trên bắt buộc hoặc cho phép người dưới làm gì. Rất phổ biến trong mẫu câu xin phép lịch sự: 〜させていただけませんか.',
      examples: [
        { from: '行きます', to: '行かせる' },
        { from: '食べます', to: '食べさせる' },
        { from: 'します', to: 'させる' },
      ],
      route: '/luyen-the-sai-khien',
      gradientClass: 'grad-causative',
      accentColor: '#9333ea',
    },
    {
      id: 'causative-passive',
      jpBadge: '使受',
      level: 'N4',
      title: 'Thể Sai Khiến Bị Động',
      subtitle: 'Bị bắt buộc phải làm việc ngoài ý muốn ("Bị ép làm...")',
      jpTitle: '使役受身形',
      formula: '〜あされる / 〜させられる',
      description: 'Kết hợp giữa Sai Khiến và Bị Động, diễn tả tâm trạng khó chịu, bị người khác ép buộc phải làm một việc gì đó (Bị ép uống rượu, bị phạt dọn dẹp...).',
      examples: [
        { from: '飲みます', to: '飲まされる' },
        { from: '食べます', to: '食べさせられる' },
        { from: 'します', to: 'させられる' },
      ],
      route: '/luyen-the-sai-khien-bi-dong',
      gradientClass: 'grad-causative-passive',
      accentColor: '#c026d3',
    },
  ];

  get filteredForms(): VerbFormHubItem[] {
    if (this.activeFilter === 'all') {
      return this.verbForms;
    }
    return this.verbForms.filter((f) => f.level === this.activeFilter);
  }

  setFilter(filter: 'all' | 'N5' | 'N4'): void {
    this.activeFilter = filter;
  }
}

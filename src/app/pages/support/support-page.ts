import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { APP_CONTACT_INFO } from '../../models/app.config';

type SupportSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type SupportPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  updated: string;
  sections: SupportSection[];
};

const SUPPORT_PAGES: Record<string, SupportPageContent> = {
  faq: {
    eyebrow: 'Câu hỏi thường gặp',
    title: 'Những điều nên biết trước khi đăng ký',
    description:
      'Câu trả lời ngắn gọn về chương trình, chi phí, hồ sơ và cách VieJap hỗ trợ.',
    icon: 'fas fa-circle-question',
    updated: '14/06/2026',
    sections: [
      {
        title: 'Tôi chưa biết tiếng Nhật có đăng ký được không?',
        paragraphs: [
          'Có thể bắt đầu tìm hiểu khi chưa biết tiếng Nhật. Trình độ cần đạt và thời gian học phụ thuộc chương trình, đơn tuyển và thời điểm dự kiến xuất cảnh.',
        ],
      },
      {
        title: 'Làm sao biết mình phù hợp Kỹ sư, Tokutei hay Thực tập sinh?',
        paragraphs: [
          'Cần xem đồng thời bằng cấp, kinh nghiệm, tiếng Nhật và mục tiêu cá nhân. Bạn có thể làm bài gợi ý trên trang chủ, sau đó gửi hồ sơ hiện tại để VieJap kiểm tra lại.',
        ],
      },
      {
        title: 'Chi phí có giống nhau cho mọi hồ sơ không?',
        paragraphs: [
          'Không. Chi phí thay đổi theo chương trình, thời lượng đào tạo, trường học hoặc đơn tuyển. Trước khi thanh toán, bạn nên nhận bảng phí ghi rõ khoản đã bao gồm, chưa bao gồm và điều kiện hoàn phí.',
        ],
      },
      {
        title: 'Danh sách đơn tuyển có được cập nhật thường xuyên không?',
        paragraphs: [
          'Trang chủ hiển thị trực tiếp Google Sheet của VieJap. Điều kiện và thời hạn có thể thay đổi, vì vậy hãy gửi mã đơn để được xác nhận trước khi chuẩn bị hồ sơ.',
        ],
      },
      {
        title: 'Tư vấn ban đầu có mất phí không?',
        paragraphs: [
          'Việc trao đổi ban đầu để xác định chương trình và các giấy tờ đang có là miễn phí.',
        ],
      },
    ],
  },
  privacy: {
    eyebrow: 'Chính sách bảo mật',
    title: 'Cách VieJap tiếp nhận và sử dụng thông tin',
    description:
      'Chính sách này giải thích những dữ liệu có thể được thu thập khi bạn liên hệ hoặc gửi biểu mẫu.',
    icon: 'fas fa-shield-halved',
    updated: '14/06/2026',
    sections: [
      {
        title: 'Thông tin có thể được tiếp nhận',
        items: [
          'Thông tin liên hệ như họ tên, số điện thoại, email hoặc tài khoản Zalo.',
          'Thông tin học tập, kinh nghiệm, trình độ tiếng Nhật và nguyện vọng chương trình.',
          'Giấy tờ do bạn chủ động cung cấp để kiểm tra điều kiện hồ sơ.',
          'Thông tin kỹ thuật cơ bản do trình duyệt hoặc máy chủ ghi nhận để vận hành website.',
        ],
      },
      {
        title: 'Mục đích sử dụng',
        items: [
          'Liên hệ tư vấn và trả lời yêu cầu của bạn.',
          'Kiểm tra điều kiện, chuẩn bị hồ sơ và hỗ trợ quy trình đăng ký.',
          'Cải thiện nội dung, biểu mẫu và trải nghiệm sử dụng website.',
          'Thực hiện nghĩa vụ pháp lý khi có yêu cầu hợp lệ.',
        ],
      },
      {
        title: 'Chia sẻ và lưu trữ',
        paragraphs: [
          'VieJap chỉ chia sẻ thông tin với đơn vị liên quan đến hồ sơ khi cần thiết cho mục đích bạn đã yêu cầu hoặc khi pháp luật yêu cầu. Thời gian lưu giữ phụ thuộc mục đích xử lý và nghĩa vụ hồ sơ.',
        ],
      },
      {
        title: 'Quyền của bạn',
        items: [
          'Yêu cầu kiểm tra, điều chỉnh hoặc bổ sung thông tin đã cung cấp.',
          'Yêu cầu ngừng liên hệ quảng bá.',
          'Hỏi về phạm vi sử dụng hoặc đề nghị xóa dữ liệu khi không còn nghĩa vụ lưu giữ.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Điều khoản sử dụng',
    title: 'Nguyên tắc khi sử dụng website VieJap',
    description:
      'Website cung cấp thông tin tham khảo và công cụ hỗ trợ tìm hiểu chương trình.',
    icon: 'fas fa-file-contract',
    updated: '14/06/2026',
    sections: [
      {
        title: 'Phạm vi thông tin',
        paragraphs: [
          'Nội dung trên website giúp người dùng hiểu chương trình, quyền lợi và cách chuẩn bị. Thông tin cụ thể của từng hồ sơ chỉ được xác nhận sau khi đối chiếu giấy tờ và đơn tuyển.',
        ],
      },
      {
        title: 'Trách nhiệm của người dùng',
        items: [
          'Cung cấp thông tin chính xác khi yêu cầu kiểm tra hồ sơ.',
          'Không sử dụng website để gửi nội dung trái pháp luật hoặc gây gián đoạn hệ thống.',
          'Tự kiểm tra hợp đồng, bảng phí và giấy tờ trước khi ký hoặc thanh toán.',
        ],
      },
      {
        title: 'Liên kết bên ngoài',
        paragraphs: [
          'Website có thể mở Zalo, Google Sheet, Google Form hoặc nguồn thông tin chính thức. Các dịch vụ đó có điều khoản và chính sách riêng.',
        ],
      },
      {
        title: 'Thay đổi nội dung',
        paragraphs: [
          'VieJap có thể cập nhật nội dung để phản ánh thay đổi của chương trình hoặc quy trình. Ngày cập nhật được hiển thị trên trang này.',
        ],
      },
    ],
  },
  guide: {
    eyebrow: 'Hướng dẫn đăng ký',
    title: 'Bắt đầu hồ sơ theo 5 bước dễ theo dõi',
    description:
      'Bạn chưa cần chuẩn bị mọi giấy tờ ngay từ đầu. Hãy bắt đầu bằng việc xác định đúng hướng đi.',
    icon: 'fas fa-route',
    updated: '14/06/2026',
    sections: [
      {
        title: '1. Xem chương trình và làm bài gợi ý',
        paragraphs: [
          'Đọc bốn chương trình trên trang chủ hoặc làm bài kiểm tra ngắn để xác định hướng phù hợp ban đầu.',
        ],
      },
      {
        title: '2. Chọn đơn tuyển hoặc mục tiêu học tập',
        paragraphs: [
          'Xem danh sách đơn đang mở. Với du học, xác định kỳ nhập học, khu vực và khả năng tài chính.',
        ],
      },
      {
        title: '3. Gửi thông tin để kiểm tra',
        items: [
          'Bằng cấp hoặc trình độ học vấn hiện tại.',
          'Kinh nghiệm làm việc và chứng chỉ nghề nếu có.',
          'Trình độ tiếng Nhật hoặc thời gian đã học.',
          'Mục tiêu và thời điểm dự kiến sang Nhật.',
        ],
      },
      {
        title: '4. Nhận lộ trình và bảng chi phí',
        paragraphs: [
          'Yêu cầu nội dung bằng văn bản: các bước chuẩn bị, khoản phí, khoản chưa bao gồm và điều kiện hoàn phí.',
        ],
      },
      {
        title: '5. Chỉ đăng ký khi đã hiểu rõ',
        paragraphs: [
          'Đọc kỹ hồ sơ và hợp đồng, giữ biên nhận cho mọi khoản thanh toán và hỏi lại ngay khi thông tin chưa rõ.',
        ],
      },
    ],
  },
};

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './support-page.html',
  styleUrl: './support-page.scss',
})
export class SupportPage {
  protected readonly contactInfo = APP_CONTACT_INFO;
  protected readonly page: SupportPageContent;

  constructor(route: ActivatedRoute) {
    const pageKey = route.snapshot.data['pageKey'] as string;
    this.page = SUPPORT_PAGES[pageKey] ?? SUPPORT_PAGES['faq'];
  }
}

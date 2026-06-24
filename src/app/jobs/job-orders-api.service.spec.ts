import { TestBed } from '@angular/core/testing';
import { AdminAuthService } from '../admin/admin-auth.service';
import { JobOrdersApiService } from './job-orders-api.service';

describe('JobOrdersApiService', () => {
  let service: JobOrdersApiService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobOrdersApiService);
    fetchSpy = spyOn(globalThis, 'fetch');
  });

  it('loads public orders through the dedicated public API alias', async () => {
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ orders: [{ id: 'order-1', title: 'Kỹ sư' }] }), { status: 200 }),
    );

    const orders = await service.listPublic();

    expect(orders.length).toBe(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/orders-api/orders.php',
      jasmine.objectContaining({ credentials: 'same-origin' }),
    );
  });

  it('protects admin mutations with the current CSRF token', async () => {
    const auth = TestBed.inject(AdminAuthService);
    auth.session.set({ authenticated: true, username: 'admin', csrfToken: 'csrf-token' });
    fetchSpy.and.resolveTo(
      new Response(
        JSON.stringify({
          order: { id: 'order-1', title: 'Kỹ sư' },
        }),
        { status: 201 },
      ),
    );

    await service.create({
      orderCode: 'KS-01',
      title: 'Kỹ sư',
      category: 'ky-su',
      location: 'Tokyo',
      salary: '200.000 yên/tháng',
      ageRange: '22 - 30',
      summary: 'Mô tả',
      requirements: 'Yêu cầu',
      departureMonth: '12/2026',
      status: 'draft',
      isFeatured: false,
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/admin-api/orders.php',
      jasmine.objectContaining({
        method: 'POST',
        headers: jasmine.objectContaining({ 'X-CSRF-Token': 'csrf-token' }),
      }),
    );
  });
});

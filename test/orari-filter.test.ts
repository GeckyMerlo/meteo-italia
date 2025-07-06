import { GET } from '../src/app/api/3bMeteo/orari/route';

// Mock NextRequest for test
class MockRequest {
  url: string;
  constructor(city: string, day: string) {
    this.url = `http://localhost/api/3bMeteo/orari?city=${city}&day=${day}`;
  }
}

describe('3bMeteo hourly API', () => {
  it('should return only hours >= now (Europe/Rome)', async () => {
    // Set a fixed time for test (simulate 15:45 Europe/Rome)
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate('2025-07-06T13:45:00.000Z'); // 15:45 Europe/Rome
      }
      static now() {
        return new RealDate('2025-07-06T13:45:00.000Z').getTime();
      }
    } as any;

    const req = new MockRequest('milano', '0');
    const res = await GET(req as any);
    const data = await res.json();
    // All times must be >= 15:45
    const valid = data.every((item: any) => {
      const [h, m] = item.time.split(':').map(Number);
      return h > 15 || (h === 15 && m >= 45);
    });
    expect(valid).toBe(true);
    // Restore Date
    global.Date = RealDate;
  });
});

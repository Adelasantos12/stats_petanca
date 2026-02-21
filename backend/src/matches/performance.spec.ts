import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MatchesService - Performance Calculation', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: PrismaService,
          useValue: {}, // Mock prisma
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should calculate performance correctly according to the formula', () => {
    // Formula: ((Suma + 2n) / (4n)) * 100

    // Test case 1: n=1, suma=2
    // ((2 + 2*1) / (4*1)) * 100 = (4 / 4) * 100 = 100
    const res1 = (service as any).calculateMetrics([{ effectivenessScore: 2 }]);
    expect(res1.performance).toBe(100);

    // Test case 2: n=1, suma=-2
    // ((-2 + 2*1) / (4*1)) * 100 = (0 / 4) * 100 = 0
    const res2 = (service as any).calculateMetrics([{ effectivenessScore: -2 }]);
    expect(res2.performance).toBe(0);

    // Test case 3: n=2, suma=1 (1 and 0)
    // ((1 + 2*2) / (4*2)) * 100 = (5 / 8) * 100 = 62.5
    const res3 = (service as any).calculateMetrics([
      { effectivenessScore: 1 },
      { effectivenessScore: 0 }
    ]);
    expect(res3.performance).toBe(62.5);

    // Test case 4: n=0
    const res4 = (service as any).calculateMetrics([]);
    expect(res4.performance).toBeNull();
  });
});

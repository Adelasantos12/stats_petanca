import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { corsConfig } from '../src/cors.config';

describe('CORS (e2e)', () => {
  let app: INestApplication;

  const prismaServiceMock = {
    onModuleInit: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    match: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    player: { create: jest.fn() },
    matchPlayer: { create: jest.fn() },
    hand: { create: jest.fn() },
    throw: { create: jest.fn() },
    $transaction: jest.fn((cb) => cb(prismaServiceMock)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaServiceMock)
    .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors(corsConfig);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('OPTIONS /matches should return 204 and correct headers', () => {
    return request(app.getHttpServer())
      .options('/matches')
      .set('Origin', 'https://stats_petanca-production.up.railway.app')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'https://stats_petanca-production.up.railway.app')
      .expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
      .expect('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  });

  it('OPTIONS /matches from disallowed origin should not return allow header', () => {
     return request(app.getHttpServer())
      .options('/matches')
      .set('Origin', 'https://evil.com')
      .expect((res) => {
          if (res.headers['access-control-allow-origin'] === 'https://evil.com') {
              throw new Error('Should not allow evil.com');
          }
      });
  });
});

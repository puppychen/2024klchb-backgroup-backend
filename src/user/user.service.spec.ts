import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    sourceKeyword: {
      findMany: jest.Mock;
    };
    vaccineNotifySendLog: {
      findMany: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  const baseLog = {
    sendBatchId: 'batch-1',
    status: 'sent',
    message: '疫苗提醒訊息',
    errorMessage: null,
    sentAt: new Date('2026-05-01T08:00:00.000Z'),
    createdAt: new Date('2026-05-01T08:00:01.000Z'),
    lineId: 'U123',
    user: {
      uuid: 'user-uuid',
      lineId: 'U123',
      name: 'LINE 使用者',
      content: null,
    },
    child: {
      uuid: 'child-uuid',
      name: '小明',
      birthday: '2025-01-03',
    },
    vaccineNotify: {
      uuid: 'notify-1',
      vaccineName: 'BCG',
      cycleYearMonth: '2026-05',
      attemptCount: 1,
      attemptedAt: new Date('2026-05-01T08:00:00.000Z'),
    },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      sourceKeyword: {
        findMany: jest.fn(),
      },
      vaccineNotifySendLog: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: HttpService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('groups vaccine notify send logs by actual message', async () => {
    prisma.vaccineNotifySendLog.findMany.mockResolvedValue([
      baseLog,
      {
        ...baseLog,
        vaccineNotify: {
          ...baseLog.vaccineNotify,
          uuid: 'notify-2',
          vaccineName: 'B 型肝炎',
        },
      },
    ]);

    const result = await service.findVaccineNotifyLogs();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      sendBatchId: 'batch-1',
      status: 'sent',
      message: '疫苗提醒訊息',
      userUuid: 'user-uuid',
      userName: 'LINE 使用者',
      childUuid: 'child-uuid',
      childName: '小明',
      childBirthday: '2025-01-03',
      childBirthYear: '2025',
      vaccineNames: ['BCG', 'B 型肝炎'],
      vaccineNotifyUuids: ['notify-1', 'notify-2'],
      cycleYearMonth: '2026-05',
    });
  });

  it('does not return incomplete legacy logs without child relation', async () => {
    prisma.vaccineNotifySendLog.findMany.mockResolvedValue([
      {
        ...baseLog,
        child: null,
      },
    ]);

    const result = await service.findVaccineNotifyLogs();

    expect(result).toEqual([]);
  });

  it('filters vaccine notify send logs by user uuid', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 123 });
    prisma.vaccineNotifySendLog.findMany.mockResolvedValue([baseLog]);

    await service.findUserVaccineNotifyLogs('user-uuid');

    expect(prisma.vaccineNotifySendLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 123,
          childId: { not: null },
        }),
      }),
    );
  });

  it('throws not found when querying vaccine logs for missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.findUserVaccineNotifyLogs('missing-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adds vaccine notify log count to user list without fetching per user', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        uuid: 'user-1',
        lineId: 'U1',
        name: '使用者一',
        pictureUrl: null,
        content: null,
        sourceKeyword: null,
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        Children: [],
        Note: [],
      },
      {
        id: 2,
        uuid: 'user-2',
        lineId: 'U2',
        name: '使用者二',
        pictureUrl: null,
        content: null,
        sourceKeyword: null,
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        Children: [],
        Note: [],
      },
    ]);
    prisma.vaccineNotifySendLog.groupBy.mockResolvedValue([
      { userId: 1, _count: { _all: 3 } },
    ]);

    const result = await service.findAll();

    expect(prisma.vaccineNotifySendLog.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['userId'],
        where: expect.objectContaining({
          userId: { in: [1, 2] },
          childId: { not: null },
          child: { isNot: null },
        }),
      }),
    );
    expect(result).toEqual([
      expect.objectContaining({ uuid: 'user-1', vaccineNotifyLogCount: 3 }),
      expect.objectContaining({ uuid: 'user-2', vaccineNotifyLogCount: 0 }),
    ]);
  });
});

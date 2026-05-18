import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { AttachmentUrlService } from './attachment-url.service';

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
    consultation: {
      groupBy: jest.Mock;
    };
    chatRoom: {
      findMany: jest.Mock;
    };
    chatRoomMessage: {
      groupBy: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    chatRoomAttachment: {
      update: jest.Mock;
    };
  };
  let attachmentUrlService: {
    generateReadUrl: jest.Mock;
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
      consultation: {
        groupBy: jest.fn(),
      },
      chatRoom: {
        findMany: jest.fn(),
      },
      chatRoomMessage: {
        groupBy: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      chatRoomAttachment: {
        update: jest.fn(),
      },
    };
    attachmentUrlService = {
      generateReadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: HttpService, useValue: { get: jest.fn() } },
        { provide: AttachmentUrlService, useValue: attachmentUrlService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma.sourceKeyword.findMany.mockResolvedValue([]);
    prisma.vaccineNotifySendLog.groupBy.mockResolvedValue([]);
    prisma.consultation.groupBy.mockResolvedValue([]);
    prisma.chatRoom.findMany.mockResolvedValue([]);
    prisma.chatRoomMessage.groupBy.mockResolvedValue([]);
    prisma.chatRoomMessage.findUnique.mockResolvedValue(null);
    prisma.chatRoomMessage.findMany.mockResolvedValue([]);
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
    prisma.consultation.groupBy.mockResolvedValue([]);
    prisma.chatRoom.findMany.mockResolvedValue([]);
    prisma.chatRoomMessage.groupBy.mockResolvedValue([]);

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

  it('sorts users by latest consultation and then createdAt when no consultation exists', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        uuid: 'older-no-consultation',
        lineId: 'U1',
        name: '較早加入',
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
        uuid: 'latest-consultation',
        lineId: 'U2',
        name: '有最新諮詢',
        pictureUrl: null,
        content: null,
        sourceKeyword: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        Children: [],
        Note: [],
      },
      {
        id: 3,
        uuid: 'newer-no-consultation',
        lineId: 'U3',
        name: '較晚加入',
        pictureUrl: null,
        content: null,
        sourceKeyword: null,
        createdAt: new Date('2026-05-02T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
        Children: [],
        Note: [],
      },
    ]);
    prisma.consultation.groupBy.mockResolvedValue([
      {
        userId: 2,
        _count: { _all: 1 },
        _max: { createdAt: new Date('2026-05-03T00:00:00.000Z') },
      },
    ]);

    const result = await service.findAll();

    expect(result.map((user) => user.uuid)).toEqual([
      'latest-consultation',
      'newer-no-consultation',
      'older-no-consultation',
    ]);
  });

  it('merges direct consultation, chat-room consultation and chat-message stats in batches', async () => {
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
    ]);
    prisma.chatRoom.findMany.mockResolvedValue([
      { id: 10, uuid: 'room-uuid', title: '聊天室', userId: 1 },
    ]);
    prisma.consultation.groupBy
      .mockResolvedValueOnce([
        {
          userId: 1,
          _count: { _all: 2 },
          _max: { createdAt: new Date('2026-05-03T00:00:00.000Z') },
        },
      ])
      .mockResolvedValueOnce([
        {
          chatRoomId: 10,
          _count: { _all: 1 },
          _max: { createdAt: new Date('2026-05-04T00:00:00.000Z') },
        },
      ]);
    prisma.chatRoomMessage.groupBy.mockResolvedValue([
      {
        chatRoomId: 10,
        _count: { _all: 4 },
        _max: { createdAt: new Date('2026-05-05T00:00:00.000Z') },
      },
    ]);

    const result = await service.findAll();

    expect(result[0]).toMatchObject({
      consultationCount: 3,
      latestConsultationAt: new Date('2026-05-04T00:00:00.000Z'),
      chatMessageCount: 4,
      latestChatMessageAt: new Date('2026-05-05T00:00:00.000Z'),
    });
    expect(prisma.consultation.groupBy).toHaveBeenCalledTimes(2);
    expect(prisma.chatRoomMessage.groupBy).toHaveBeenCalledTimes(1);
  });

  it('returns user chat messages with merged rooms, cursor filtering and refreshed attachment URL', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.chatRoom.findMany.mockResolvedValue([
      { id: 10, uuid: 'room-1', title: '第一次諮詢', userId: 1 },
      { id: 11, uuid: 'room-2', title: '第二次諮詢', userId: 1 },
    ]);
    prisma.chatRoomMessage.findUnique.mockResolvedValue({
      id: 99,
      chatRoomId: 10,
      createdAt: new Date('2026-05-05T00:00:00.000Z'),
    });
    prisma.chatRoomMessage.findMany.mockResolvedValue([
      {
        id: 98,
        uuid: 'msg-1',
        chatRoomId: 10,
        senderType: 'user',
        content: '使用者訊息',
        messageType: 'text',
        createdAt: new Date('2026-05-04T00:00:00.000Z'),
        chatRoom: { uuid: 'room-1', title: '第一次諮詢' },
        senderUser: {
          uuid: 'user-uuid',
          name: null,
          content: { profile: { displayName: 'LINE 使用者' } },
        },
        senderConsultant: null,
        ChatRoomAttachment: [
          {
            id: 100,
            uuid: 'attachment-1',
            fileName: 'photo.jpg',
            fileSize: 2048,
            fileType: 'image/jpeg',
            attachmentType: 'image',
            status: 'uploaded',
            downloadUrl: null,
            downloadUrlExpires: null,
            storagePath: 'chat/photo.jpg',
          },
        ],
      },
    ]);
    attachmentUrlService.generateReadUrl.mockResolvedValue({
      downloadUrl: 'https://storage.example/photo.jpg',
      expiresAt: new Date('2026-05-12T00:00:00.000Z'),
    });

    const result = await service.findUserChatMessages(
      'user-uuid',
      'admin-uuid',
      50,
      'cursor-msg',
    );

    expect(prisma.chatRoomMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          chatRoomId: { in: [10, 11] },
          isDeleted: false,
          OR: expect.any(Array),
        }),
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 51,
      }),
    );
    expect(result.items[0]).toMatchObject({
      uuid: 'msg-1',
      chatRoomUuid: 'room-1',
      senderType: 'user',
      senderName: 'LINE 使用者',
      attachments: [
        expect.objectContaining({
          uuid: 'attachment-1',
          downloadUrl: 'https://storage.example/photo.jpg',
        }),
      ],
    });
    expect(prisma.chatRoomAttachment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 100 },
      }),
    );
  });

  it('throws not found when querying chat messages for missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.findUserChatMessages('missing-user', 'admin-uuid'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

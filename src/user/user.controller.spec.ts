import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    findAll: jest.Mock;
    findVaccineNotifyLogs: jest.Mock;
    findUserVaccineNotifyLogs: jest.Mock;
    findUserChatMessages: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      findAll: jest.fn(),
      findVaccineNotifyLogs: jest.fn(),
      findUserVaccineNotifyLogs: jest.fn(),
      findUserChatMessages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    })
      .overrideGuard(JwtAdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('returns all vaccine notify logs', async () => {
    const logs = [{ id: 'batch-1' }];
    userService.findVaccineNotifyLogs.mockResolvedValue(logs);

    await expect(controller.findVaccineNotifyLogs()).resolves.toBe(logs);
  });

  it('returns vaccine notify logs by user uuid', async () => {
    const logs = [{ id: 'batch-1' }];
    userService.findUserVaccineNotifyLogs.mockResolvedValue(logs);

    await expect(
      controller.findUserVaccineNotifyLogs('user-uuid'),
    ).resolves.toBe(logs);
    expect(userService.findUserVaccineNotifyLogs).toHaveBeenCalledWith(
      'user-uuid',
    );
  });

  it('returns chat messages by user uuid with admin audit identity and safe limit', async () => {
    const page = { items: [], hasMore: false, nextCursor: null };
    userService.findUserChatMessages.mockResolvedValue(page);

    await expect(
      controller.findUserChatMessages('user-uuid', '200', 'cursor-uuid', {
        user: { uuid: 'admin-uuid' },
      }),
    ).resolves.toBe(page);
    expect(userService.findUserChatMessages).toHaveBeenCalledWith(
      'user-uuid',
      'admin-uuid',
      100,
      'cursor-uuid',
    );
  });
});

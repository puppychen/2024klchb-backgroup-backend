import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    findVaccineNotifyLogs: jest.Mock;
    findUserVaccineNotifyLogs: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      findVaccineNotifyLogs: jest.fn(),
      findUserVaccineNotifyLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    })
      .overrideGuard(JwtAdminGuard)
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
});

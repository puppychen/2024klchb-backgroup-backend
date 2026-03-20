import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
import { User, Children, Note } from '@prisma/client';
import {
  CreateChildDto,
  UpdateChildDto,
  CreateNoteDto,
  UpdateNoteDto,
} from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async findSourceUsers() {
    // 1. 查詢有 sourceKeyword 的 users，依關聯時間倒序
    const users = await this.prisma.user.findMany({
      where: { sourceKeyword: { not: null } },
      orderBy: [{ sourceKeywordAt: { sort: 'desc', nulls: 'last' } }],
      select: {
        uuid: true,
        lineId: true,
        name: true,
        content: true,
        sourceKeyword: true,
        sourceKeywordAt: true,
        createdAt: true,
      },
    });

    // 2. 批次查 source_keywords 取 name mapping
    const keywords = [...new Set(users.map((u) => u.sourceKeyword!))];
    const sources = await this.prisma.sourceKeyword.findMany({
      where: { keyword: { in: keywords } },
      select: { keyword: true, name: true },
    });
    const sourceNameMap = new Map(sources.map((s) => [s.keyword, s.name]));

    // 3. 組合回傳
    return users.map((u) => ({
      uuid: u.uuid,
      lineId: u.lineId,
      lineName: u.name || null,
      sourceKeyword: u.sourceKeyword,
      sourceName: sourceNameMap.get(u.sourceKeyword!) || u.sourceKeyword,
      sourceKeywordAt: u.sourceKeywordAt,
      createdAt: u.createdAt,
    }));
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Children: true,
        Note: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    // LINE profile fallback：name 為 null 的使用者，透過 LINE Bot API 取得並回寫
    await this.backfillLineProfiles(users);

    // 批次查 source_keywords 取 name mapping
    const keywords = [
      ...new Set(users.map((u) => u.sourceKeyword).filter(Boolean)),
    ] as string[];
    const sourceNameMap = new Map<string, string>();
    if (keywords.length > 0) {
      const sources = await this.prisma.sourceKeyword.findMany({
        where: { keyword: { in: keywords } },
        select: { keyword: true, name: true },
      });
      sources.forEach((s) => sourceNameMap.set(s.keyword, s.name));
    }

    return users.map((u) => ({
      ...u,
      sourceName: u.sourceKeyword
        ? sourceNameMap.get(u.sourceKeyword) || null
        : null,
    }));
  }

  private static readonly BACKFILL_BATCH_LIMIT = 30;

  /**
   * 對 name 為 null 的使用者，補回 LINE 名稱。
   * 階段一：從 DB 已有的 content.profile.displayName 回寫（純 DB 操作，無上限）。
   * 階段二：仍缺 name 的使用者，透過 LINE Bot API 取得（限 BACKFILL_BATCH_LIMIT 筆、每筆間隔 200ms）。
   * 單筆失敗不影響整體。
   */
  private async backfillLineProfiles(
    users: (User & { Children: Children[]; Note: Note[] })[],
  ): Promise<void> {
    const missingNameUsers = users.filter((u) => !u.name && u.lineId);
    if (missingNameUsers.length === 0) {
      return;
    }

    // 階段一：從 content.profile 補回（純 DB 操作，不受 rate limit 影響）
    const stillMissing: typeof missingNameUsers = [];
    for (const user of missingNameUsers) {
      const content = user.content as Record<string, any> | null;
      const profileName = content?.profile?.displayName;
      const profilePicture = content?.profile?.pictureUrl;

      if (profileName) {
        const updateData: Record<string, unknown> = { name: profileName };
        if (profilePicture && !user.pictureUrl) {
          updateData.pictureUrl = profilePicture;
        }
        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
        user.name = profileName;
        if (profilePicture && !user.pictureUrl) {
          user.pictureUrl = profilePicture;
        }
      } else {
        stillMissing.push(user);
      }
    }

    if (stillMissing.length > 0) {
      this.logger.log(
        `Backfill phase 1: restored ${missingNameUsers.length - stillMissing.length} name(s) from content.profile, ${stillMissing.length} still missing`,
      );
    }

    // 階段二：LINE Bot API fallback（限 BACKFILL_BATCH_LIMIT 筆、每筆間隔 200ms）
    const lineAccessToken = this.configService.get<string>('LINE_ACCESS_TOKEN');
    if (!lineAccessToken || stillMissing.length === 0) {
      return;
    }

    const batch = stillMissing.slice(0, UserService.BACKFILL_BATCH_LIMIT);

    if (stillMissing.length > UserService.BACKFILL_BATCH_LIMIT) {
      this.logger.log(
        `Backfill phase 2: calling LINE API for ${batch.length}/${stillMissing.length} user(s) (rest deferred to next request)`,
      );
    } else {
      this.logger.log(
        `Backfill phase 2: calling LINE API for ${batch.length} user(s)`,
      );
    }

    for (const user of batch) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(
            `https://api.line.me/v2/bot/profile/${user.lineId}`,
            {
              headers: {
                Authorization: `Bearer ${lineAccessToken}`,
              },
            },
          ),
        );

        const profile = response.data;
        const updateData: Record<string, unknown> = {};

        if (profile.displayName) {
          updateData.name = profile.displayName;
          user.name = profile.displayName;
        }
        if (profile.pictureUrl && !user.pictureUrl) {
          updateData.pictureUrl = profile.pictureUrl;
          user.pictureUrl = profile.pictureUrl;
        }

        if (Object.keys(updateData).length > 0) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to fetch LINE profile for user ${user.lineId}: ${error.message}`,
        );
      }

      // 延遲 200ms 避免觸發 LINE rate limit
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        Children: true,
        Note: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getChildren(userUuid: string): Promise<Children[]> {
    const user = await this.findOne(userUuid);

    return this.prisma.children.findMany({
      where: { userId: user.id },
    });
  }

  async createChild(userUuid: string, data: CreateChildDto): Promise<Children> {
    const user = await this.findOne(userUuid);

    return this.prisma.children.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
  }

  async updateChild(
    userUuid: string,
    childUuid: string,
    data: UpdateChildDto,
  ): Promise<Children> {
    const user = await this.findOne(userUuid);

    const child = await this.prisma.children.findFirst({
      where: {
        uuid: childUuid,
        userId: user.id,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return this.prisma.children.update({
      where: { uuid: childUuid },
      data,
    });
  }

  async removeChild(userUuid: string, childUuid: string): Promise<Children> {
    const user = await this.findOne(userUuid);

    const child = await this.prisma.children.findFirst({
      where: {
        uuid: childUuid,
        userId: user.id,
      },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return this.prisma.children.delete({
      where: { uuid: childUuid },
    });
  }

  async getNotes(userUuid: string): Promise<Note[]> {
    const user = await this.findOne(userUuid);

    return this.prisma.note.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      include: {
        accessToken: true,
      },
    });
  }

  async getNote(userUuid: string, noteUuid: string): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        accessToken: true,
        NoteEditHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async createNote(userUuid: string, data: CreateNoteDto): Promise<Note> {
    const user = await this.findOne(userUuid);

    return this.prisma.note.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
  }

  async updateNote(
    userUuid: string,
    noteUuid: string,
    data: UpdateNoteDto,
  ): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.noteEditHistory.create({
      data: {
        noteId: note.id,
        accessTokenId: note.accessTokenId,
        beforeContent: note.content,
        afterContent: data.content,
      },
    });

    return this.prisma.note.update({
      where: { uuid: noteUuid },
      data,
    });
  }

  async removeNote(userUuid: string, noteUuid: string): Promise<Note> {
    const user = await this.findOne(userUuid);

    const note = await this.prisma.note.findFirst({
      where: {
        uuid: noteUuid,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.noteEditHistory.create({
      data: {
        noteId: note.id,
        accessTokenId: note.accessTokenId,
        beforeContent: note.content,
        afterContent: '刪除!!',
      },
    });

    return this.prisma.note.update({
      where: { uuid: noteUuid },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

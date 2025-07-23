import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateChildDto,
  UpdateChildDto,
  CreateNoteDto,
  UpdateNoteDto,
  UserResponseDto,
  NoteResponseDto,
} from './dto';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';

@ApiTags('用戶管理')
@ApiBearerAuth('JWT-auth')
@Controller('user')
@UseGuards(JwtAdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '取得所有用戶列表' })
  @ApiResponse({
    status: 200,
    description: '成功取得用戶列表',
    type: [UserResponseDto],
  })
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return UserResponseDto.fromArray(users);
  }

  @ApiOperation({ summary: '根據 UUID 取得單一用戶資料' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiResponse({
    status: 200,
    description: '成功取得用戶資料',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '找不到用戶' })
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const user = await this.userService.findOne(uuid);
    return UserResponseDto.from(user);
  }

  @Get(':uuid/children')
  getChildren(@Param('uuid') uuid: string) {
    return this.userService.getChildren(uuid);
  }

  @Post(':uuid/children')
  createChild(
    @Param('uuid') uuid: string,
    @Body() createChildDto: CreateChildDto,
  ) {
    return this.userService.createChild(uuid, createChildDto);
  }

  @Patch(':uuid/children/:childUuid')
  updateChild(
    @Param('uuid') uuid: string,
    @Param('childUuid') childUuid: string,
    @Body() updateChildDto: UpdateChildDto,
  ) {
    return this.userService.updateChild(uuid, childUuid, updateChildDto);
  }

  @Delete(':uuid/children/:childUuid')
  removeChild(
    @Param('uuid') uuid: string,
    @Param('childUuid') childUuid: string,
  ) {
    return this.userService.removeChild(uuid, childUuid);
  }

  @ApiOperation({ summary: '取得用戶的所有筆記' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiResponse({
    status: 200,
    description: '成功取得筆記列表',
    type: [NoteResponseDto],
  })
  @Get(':uuid/notes')
  async getNotes(@Param('uuid') uuid: string) {
    const notes = await this.userService.getNotes(uuid);
    return NoteResponseDto.fromArray(notes);
  }

  @ApiOperation({ summary: '根據 UUID 取得單一筆記及編輯歷史' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiParam({ name: 'noteUuid', description: '筆記 UUID' })
  @ApiResponse({
    status: 200,
    description: '成功取得筆記資料',
    type: NoteResponseDto,
  })
  @ApiResponse({ status: 404, description: '找不到筆記' })
  @Get(':uuid/notes/:noteUuid')
  async getNote(
    @Param('uuid') uuid: string,
    @Param('noteUuid') noteUuid: string,
  ) {
    const note = await this.userService.getNote(uuid, noteUuid);
    return NoteResponseDto.from(note);
  }

  @ApiOperation({ summary: '為用戶建立新筆記' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiResponse({
    status: 201,
    description: '成功建立筆記',
    type: NoteResponseDto,
  })
  @Post(':uuid/notes')
  async createNote(
    @Param('uuid') uuid: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    const note = await this.userService.createNote(uuid, createNoteDto);
    return NoteResponseDto.from(note);
  }

  @ApiOperation({ summary: '更新筆記內容' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiParam({ name: 'noteUuid', description: '筆記 UUID' })
  @ApiResponse({
    status: 200,
    description: '成功更新筆記',
    type: NoteResponseDto,
  })
  @ApiResponse({ status: 404, description: '找不到筆記' })
  @Patch(':uuid/notes/:noteUuid')
  async updateNote(
    @Param('uuid') uuid: string,
    @Param('noteUuid') noteUuid: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    const note = await this.userService.updateNote(
      uuid,
      noteUuid,
      updateNoteDto,
    );
    return NoteResponseDto.from(note);
  }

  @ApiOperation({ summary: '刪除筆記' })
  @ApiParam({ name: 'uuid', description: '用戶 UUID' })
  @ApiParam({ name: 'noteUuid', description: '筆記 UUID' })
  @ApiResponse({
    status: 200,
    description: '成功刪除筆記',
    type: NoteResponseDto,
  })
  @ApiResponse({ status: 404, description: '找不到筆記' })
  @Delete(':uuid/notes/:noteUuid')
  async removeNote(
    @Param('uuid') uuid: string,
    @Param('noteUuid') noteUuid: string,
  ) {
    const note = await this.userService.removeNote(uuid, noteUuid);
    return NoteResponseDto.from(note);
  }
}

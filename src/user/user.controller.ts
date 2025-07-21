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

@Controller('user')
@UseGuards(JwtAdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return UserResponseDto.fromArray(users);
  }

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

  @Get(':uuid/notes')
  async getNotes(@Param('uuid') uuid: string) {
    const notes = await this.userService.getNotes(uuid);
    return NoteResponseDto.fromArray(notes);
  }

  @Get(':uuid/notes/:noteUuid')
  async getNote(
    @Param('uuid') uuid: string,
    @Param('noteUuid') noteUuid: string,
  ) {
    const note = await this.userService.getNote(uuid, noteUuid);
    return NoteResponseDto.from(note);
  }

  @Post(':uuid/notes')
  async createNote(
    @Param('uuid') uuid: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    const note = await this.userService.createNote(uuid, createNoteDto);
    return NoteResponseDto.from(note);
  }

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

  @Delete(':uuid/notes/:noteUuid')
  async removeNote(
    @Param('uuid') uuid: string,
    @Param('noteUuid') noteUuid: string,
  ) {
    const note = await this.userService.removeNote(uuid, noteUuid);
    return NoteResponseDto.from(note);
  }
}

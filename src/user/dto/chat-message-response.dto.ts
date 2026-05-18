import { ApiProperty } from '@nestjs/swagger';

export class ChatAttachmentResponseDto {
  @ApiProperty({ description: '附件 UUID' })
  uuid: string;

  @ApiProperty({ description: '檔名' })
  fileName: string;

  @ApiProperty({ description: '檔案大小', nullable: true })
  fileSize: number | null;

  @ApiProperty({ description: 'MIME type', nullable: true })
  fileType: string | null;

  @ApiProperty({ description: '附件類型' })
  attachmentType: string;

  @ApiProperty({ description: '附件狀態' })
  status: string;

  @ApiProperty({ description: '下載 URL', nullable: true })
  downloadUrl: string | null;

  @ApiProperty({ description: '下載 URL 過期時間', nullable: true })
  downloadUrlExpires: Date | null;
}

export class ChatMessageResponseDto {
  @ApiProperty({ description: '訊息 UUID' })
  uuid: string;

  @ApiProperty({ description: '聊天室 UUID' })
  chatRoomUuid: string;

  @ApiProperty({ description: '聊天室標題', nullable: true })
  chatRoomTitle: string | null;

  @ApiProperty({ description: '訊息內容', nullable: true })
  content: string | null;

  @ApiProperty({ description: '訊息類型' })
  messageType: string;

  @ApiProperty({ description: '發送者類型' })
  senderType: string;

  @ApiProperty({ description: '發送者名稱' })
  senderName: string;

  @ApiProperty({ description: '附件', type: [ChatAttachmentResponseDto] })
  attachments: ChatAttachmentResponseDto[];

  @ApiProperty({ description: '建立時間' })
  createdAt: Date;
}

export class ChatMessagesPageResponseDto {
  @ApiProperty({ description: '訊息列表', type: [ChatMessageResponseDto] })
  items: ChatMessageResponseDto[];

  @ApiProperty({ description: '是否還有更早訊息' })
  hasMore: boolean;

  @ApiProperty({ description: '下一頁游標', nullable: true })
  nextCursor: string | null;
}

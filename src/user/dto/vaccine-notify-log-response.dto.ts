import { ApiProperty } from '@nestjs/swagger';

export class VaccineNotifyLogResponseDto {
  @ApiProperty({ description: '聚合後的訊息記錄識別碼' })
  id: string;

  @ApiProperty({ description: '發送批次 ID' })
  sendBatchId: string;

  @ApiProperty({ description: '發送狀態', enum: ['sent', 'failed'] })
  status: string;

  @ApiProperty({ description: 'LINE 訊息內容', nullable: true })
  message: string | null;

  @ApiProperty({ description: '錯誤訊息', nullable: true })
  errorMessage: string | null;

  @ApiProperty({ description: '發送時間', nullable: true })
  sentAt: Date | null;

  @ApiProperty({ description: '記錄建立時間' })
  createdAt: Date;

  @ApiProperty({ description: 'LINE ID' })
  lineId: string;

  @ApiProperty({ description: '使用者 UUID' })
  userUuid: string;

  @ApiProperty({ description: '使用者 LINE ID' })
  userLineId: string;

  @ApiProperty({ description: '使用者 LINE 名稱', nullable: true })
  userName: string | null;

  @ApiProperty({ description: '小朋友 UUID' })
  childUuid: string;

  @ApiProperty({ description: '小朋友姓名' })
  childName: string;

  @ApiProperty({ description: '小朋友生日' })
  childBirthday: string;

  @ApiProperty({ description: '小朋友出生年', nullable: true })
  childBirthYear: string | null;

  @ApiProperty({ description: '疫苗名稱清單', type: [String] })
  vaccineNames: string[];

  @ApiProperty({ description: '疫苗提醒 UUID 清單', type: [String] })
  vaccineNotifyUuids: string[];

  @ApiProperty({ description: '提醒週期', nullable: true })
  cycleYearMonth: string | null;

  @ApiProperty({ description: '嘗試次數' })
  attemptCount: number;

  @ApiProperty({ description: '最後嘗試時間', nullable: true })
  attemptedAt: Date | null;
}

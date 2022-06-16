import { IsBoolean } from 'class-validator';

export class ApproveReportDto {
  @IsBoolean()
  approve: boolean;
}

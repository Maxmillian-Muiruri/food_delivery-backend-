import { IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  documentType: string; // e.g. license, insurance
}

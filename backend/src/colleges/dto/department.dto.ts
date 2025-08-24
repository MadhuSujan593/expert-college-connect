import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class DepartmentDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  headOfDepartment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];
}

export class UpdateDepartmentDto extends DepartmentDto {
  @IsString()
  id: string;
}

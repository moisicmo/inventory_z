import { Controller, Get, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginationDto } from '@/common';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}


  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }
}

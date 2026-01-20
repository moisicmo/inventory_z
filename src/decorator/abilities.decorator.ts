import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: TypeAction;
  subject: TypeSubject;
}

export const checkAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

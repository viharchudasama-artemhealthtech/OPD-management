import { BaseEntity } from './base.model';
export { Department } from './enums/department.enum';
export { Priority } from './enums/priority.enum';
export { TokenStatus } from './enums/token-status.enum';
export { VisitType } from './enums/visit-type.enum';

import { Department } from './enums/department.enum';
import { Priority } from './enums/priority.enum';
import { TokenStatus } from './enums/token-status.enum';
import { VisitType } from './enums/visit-type.enum';

export interface OpdToken extends BaseEntity {
  readonly tokenNumber: string;
  readonly department: Department;
  readonly patientId: string;
  readonly patientName: string;
  readonly doctorId: string | null;
  readonly doctorName?: string;
  readonly visitType: VisitType;
  readonly status: TokenStatus;
  readonly priority: Priority;
  readonly appointmentId?: string;
  readonly queuePosition: number;
  readonly consultationStartedAt?: Date;
}

export interface Visit {
  readonly id: string;
  readonly tokenNumber: string;
  readonly patientId: string;
  readonly doctorId: string;
  readonly department: Department;
  readonly date: Date;
  readonly diagnosis?: string;
  readonly notes?: string;
}

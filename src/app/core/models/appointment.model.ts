import { BaseEntity } from './base.model';
export { AppointmentStatus } from './enums/appointment-status.enum';
export { Department } from './enums/department.enum';

import { AppointmentStatus } from './enums/appointment-status.enum';
import { Department } from './enums/department.enum';

export interface Appointment extends BaseEntity {
  readonly patientId: string;
  readonly patientName: string;
  readonly patientPhone?: string;
  readonly doctorId: string;
  readonly doctorName: string;
  readonly department: Department;
  readonly appointmentDate: Date;
  readonly timeSlot: string;
  readonly reason: string;
  readonly status: AppointmentStatus;
}

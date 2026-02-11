import { BaseEntity } from './base.model';
import { Gender } from './enums/gender.enum';
import { BloodGroup } from './enums/blood-group.enum';
import { Relationship } from './enums/relationship.enum';

export interface Patient extends BaseEntity {
  readonly fullName: string;
  readonly dob?: Date;
  readonly age?: number;
  readonly gender?: Gender;
  readonly phone: string;
  readonly email?: string;
  readonly idNumber?: string;
  readonly occupation?: string;
  readonly address?: string;
  readonly bloodGroup?: BloodGroup;
  readonly allergies?: string;
  readonly emergencyContact?: EmergencyContact;
  readonly medicalHistory?: MedicalHistory[];
  readonly tokenNumber?: string;
}

export interface EmergencyContact {
  readonly name: string;
  readonly phone: string;
  readonly relationship: Relationship;
}

export interface MedicalHistory {
  readonly condition: string;
  readonly diagnosedDate: Date;
  readonly notes?: string;
}

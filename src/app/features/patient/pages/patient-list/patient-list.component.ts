import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../../../core/models/patient.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AgePipe } from '../../../../shared/pipes/age.pipe';
import { PhonePipe } from '../../../../shared/pipes/phone.pipe';
import { GenderIconPipe } from '../../../../shared/pipes/gender-icon.pipe';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    AgePipe,
    PhonePipe,
    GenderIconPipe
  ],
  templateUrl: './patient-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent {
  public readonly patients$: Observable<Patient[]>;

  constructor(
    private readonly patientService: PatientService,
    private readonly router: Router,
  ) {
    this.patients$ = this.patientService.patients$;
  }

  public navigateToRegister(): void {
    this.router.navigate(['/patient/register']);
  }

}

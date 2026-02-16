import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { OpdService } from '../../../receptionist/services/opd.service';
import { AppointmentService } from '../../../receptionist/services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { OpdToken } from '../../../../core/models/opd.model';
import { TokenStatus } from '../../../../core/models/enums/token-status.enum';
import { Priority } from '../../../../core/models/enums/priority.enum';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, filter, tap } from 'rxjs/operators';

import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextareaModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    TooltipModule,
    RouterModule,
  ],
  templateUrl: './doctor-queue.component.html',
  styleUrls: ['./doctor-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorQueueComponent implements OnInit {
  private readonly errorHandler = inject(ErrorHandlerService);
  queue$!: Observable<OpdToken[]>;
  currentToken: OpdToken | null = null;
  showConsultationDialog = false;
  diagnosis = '';
  notes = '';
  TokenStatus = TokenStatus;
  Priority = Priority;

  // Filter options
  priorityOptions = [
    { label: 'Emergency', value: Priority.URGENT },
    { label: 'High', value: Priority.HIGH },
    { label: 'Normal', value: Priority.NORMAL },
  ];

  statusOptions = [
    { label: 'Checked In', value: TokenStatus.CHECKED_IN },
    { label: 'In Consultation', value: TokenStatus.IN_CONSULTATION },
    { label: 'Completed', value: TokenStatus.COMPLETED },
    { label: 'Cancelled', value: TokenStatus.CANCELLED },
  ];

  constructor(
    private readonly opdService: OpdService,
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.queue$ = this.authService.currentUser$.pipe(
      filter(user => !!user),
      switchMap(user => this.opdService.getDoctorQueue(user!.id, (user as any).department)),
      tap(queue => {
        // Sync currentToken if a patient is already in consultation (e.g. on refresh)
        const inConsultation = queue.find(t => t.status === TokenStatus.IN_CONSULTATION);
        if (inConsultation) {
          this.currentToken = inConsultation;
        } else if (this.currentToken && !queue.find(t => t.id === this.currentToken?.id)) {
          // If currentToken was set but it's no longer in the filtered queue (completed/cancelled)
          this.currentToken = null;
        }
      })
    );
  }

  callNext(token: OpdToken): void {
    if (this.currentToken) return; // Guard for concurrency
    this.opdService.updateTokenStatus(token.id, TokenStatus.IN_CONSULTATION);
    this.currentToken = { ...token, status: TokenStatus.IN_CONSULTATION };
    this.router.navigate(['/doctor/consultation', token.id], { queryParams: { patientId: token.patientId } });
  }

  completeConsultation(): void {
    if (this.currentToken) {
      this.opdService.completeVisit(this.currentToken.id, this.diagnosis, this.notes).subscribe({
        next: () => {
          this.showConsultationDialog = false;
          this.currentToken = null;
          this.diagnosis = '';
          this.notes = '';
        },
        error: () => {
          // Error is handled by global interceptor
        },
      });
    }
  }

  openConsultationDialog(token: OpdToken): void {
    this.currentToken = token;
    this.showConsultationDialog = true;
  }

  public getStatusSeverity(status: TokenStatus): string {
    switch (status) {
      case TokenStatus.CHECKED_IN: return 'success';
      case TokenStatus.IN_CONSULTATION: return 'warning';
      case TokenStatus.COMPLETED: return 'success';
      case TokenStatus.CANCELLED: return 'danger';
      default: return 'info';
    }
  }

  public getStatusColor(status: TokenStatus): string {
    switch (status) {
      case TokenStatus.CHECKED_IN: return '#22c55e';
      case TokenStatus.IN_CONSULTATION: return '#f59e0b';
      case TokenStatus.COMPLETED: return '#10b981';
      case TokenStatus.CANCELLED: return '#ef4444';
      default: return '#94a3b8';
    }
  }

  getPrioritySeverity(priority: Priority): 'danger' | 'warning' | 'info' {
    switch (priority) {
      case Priority.URGENT:
        return 'danger';
      case Priority.HIGH:
        return 'warning';
      default:
        return 'info';
    }
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case Priority.URGENT:
        return 'Emergency';
      case Priority.HIGH:
        return 'High';
      default:
        return 'Normal';
    }
  }
}

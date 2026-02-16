import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { PatientService } from '../../features/patient/services/patient.service';
import { AppointmentService } from '../../features/receptionist/services/appointment.service';
import { OpdService } from '../../features/receptionist/services/opd.service';
import { Patient } from '../models/patient.model';
import { OpdToken } from '../models/opd.model';
import { TokenStatus } from '../models/enums/token-status.enum';
import { Appointment } from '../models/appointment.model';

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    fill?: boolean;
    borderColor?: string;
    tension?: number;
    backgroundColor?: string | string[];
    hoverBackgroundColor?: string[];
    pointBackgroundColor?: string;
  }[];
}

export interface StatCard {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: string;
  color: string;
  bg: string;
}

const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#a855f7',
  accent: '#ec4899',
  warning: '#f97316',
  success: '#22c55e',
  info: '#3b82f6',
  danger: '#ef4444',
  background: 'rgba(99, 102, 241, 0.1)',
  hover: ['#4f46e5', '#9333ea', '#db2777', '#ea580c', '#16a34a', '#ca8a04'],
};

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private readonly patientService: PatientService,
    private readonly appointmentService: AppointmentService,
    private readonly opdService: OpdService,
  ) { }

  public getDailyVisits(): Observable<ChartData> {
    return combineLatest([
      this.patientService.patients$,
      this.opdService.tokens$,
      this.appointmentService.appointments$,
    ]).pipe(
      map(([patients, tokens, appointments]) => {
        const buckets = Array(6).fill(0);
        const now = new Date();

        // Unique patients by creation date
        const patientTimestamps: Date[] = [];

        patients.forEach(p => { if (p.createdAt) patientTimestamps.push(new Date(p.createdAt)); });
        tokens.forEach(t => { if (t.createdAt) patientTimestamps.push(new Date(t.createdAt)); });
        appointments.forEach(a => { if (a.createdAt) patientTimestamps.push(new Date(a.createdAt)); });

        patientTimestamps.forEach(regDate => {
          if (regDate.getDate() === now.getDate() && regDate.getMonth() === now.getMonth()) {
            const hour = regDate.getHours();
            if (hour >= 9 && hour < 11) buckets[0]++;
            else if (hour >= 11 && hour < 13) buckets[1]++;
            else if (hour >= 13 && hour < 15) buckets[2]++;
            else if (hour >= 15 && hour < 17) buckets[3]++;
            else if (hour >= 17 && hour < 19) buckets[4]++;
            else if (hour >= 19) buckets[5]++;
          }
        });

        return {
          labels: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
          datasets: [
            {
              label: 'Patient Inflow',
              data: buckets,
              fill: true,
              borderColor: CHART_COLORS.primary,
              tension: 0.4,
              backgroundColor: CHART_COLORS.background,
              pointBackgroundColor: CHART_COLORS.primary,
            },
          ],
        };
      }),
    );
  }

  public getDepartmentDistribution(): Observable<ChartData> {
    return this.opdService.tokens$.pipe(
      map((tokens: OpdToken[]) => {
        const counts: Record<string, number> = {};
        tokens.forEach(t => {
          const dept = t.department || 'General';
          counts[dept] = (counts[dept] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const data = Object.values(counts);

        return {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                CHART_COLORS.primary,
                CHART_COLORS.secondary,
                CHART_COLORS.accent,
                CHART_COLORS.warning,
                CHART_COLORS.success,
                '#eab308',
              ],
              hoverBackgroundColor: CHART_COLORS.hover,
            },
          ],
        };
      }),
    );
  }

  public getRevenueStats(): Observable<ChartData> {
    return this.appointmentService.appointments$.pipe(
      map((apps: Appointment[]) => {
        const revenue = apps.length * 500;
        return {
          labels: ['Today'],
          datasets: [
            {
              label: 'Revenue (in $)',
              data: [revenue],
              backgroundColor: CHART_COLORS.primary,
            },
          ],
        };
      }),
    );
  }

  public getWorkloadStats(): Observable<ChartData> {
    return this.opdService.tokens$.pipe(
      map((tokens: OpdToken[]) => {
        const counts: Record<string, { pending: number; completed: number }> = {};

        tokens.forEach(t => {
          const key = t.department;
          if (!counts[key]) counts[key] = { pending: 0, completed: 0 };

          if (t.status === TokenStatus.COMPLETED) counts[key].completed++;
          else if (t.status === TokenStatus.CHECKED_IN || t.status === TokenStatus.IN_CONSULTATION) counts[key].pending++;
        });

        const labels = Object.keys(counts);
        const pending = labels.map(k => counts[k].pending);
        const completed = labels.map(k => counts[k].completed);

        return {
          labels: labels.length ? labels : ['General'],
          datasets: [
            {
              label: 'Waiting',
              backgroundColor: CHART_COLORS.danger,
              data: labels.length ? pending : [0],
            },
            {
              label: 'Completed',
              backgroundColor: CHART_COLORS.success,
              data: labels.length ? completed : [0],
            },
          ],
        };
      }),
    );
  }

  public getDashboardStats(): Observable<StatCard[]> {
    return combineLatest([
      this.patientService.patients$,
      this.opdService.tokens$,
      this.appointmentService.appointments$,
    ]).pipe(
      map(([patients, tokens, appointments]: [Patient[], OpdToken[], Appointment[]]) => {
        // More robust consultation count: Completed or In Consultation with a start time
        const completedConsultations = tokens.filter(
          t => t.status === TokenStatus.COMPLETED || (t.status === TokenStatus.IN_CONSULTATION && t.consultationStartedAt),
        ).length;

        // Active Queue
        const activeQueue = tokens.filter(
          t => t.status === TokenStatus.CHECKED_IN || t.status === TokenStatus.IN_CONSULTATION,
        ).length;

        // Total unique patients across all systems
        const patientIds = new Set([
          ...patients.map(p => p.id),
          ...tokens.map(t => t.patientId),
          ...appointments.map(a => a.patientId),
        ]);

        return [
          {
            title: 'Total Patients',
            value: patientIds.size.toString(),
            trend: patientIds.size,
            trendLabel: 'total identified',
            icon: 'pi-users',
            color: 'blue',
            bg: 'bg-blue-100',
          },
          {
            title: 'Active Queue',
            value: activeQueue.toString(),
            trend: 0,
            trendLabel: 'waiting now',
            icon: 'pi-users',
            color: 'orange',
            bg: 'bg-orange-100',
          },
          {
            title: 'Consultations Done',
            value: completedConsultations.toString(),
            trend: 100,
            trendLabel: 'completion rate',
            icon: 'pi-check-circle',
            color: 'green',
            bg: 'bg-green-100',
          },
        ];
      }),
    );
  }
}

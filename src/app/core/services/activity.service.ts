import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Activity {
  id: string;
  message: string;
  time: Date;
  icon: string;
  color: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {

  private readonly activitiesSubject: BehaviorSubject<Activity[]>;
  public readonly activities$: Observable<Activity[]>;
  private readonly STORAGE_KEY = 'system_activities';
  private readonly MAX_ACTIVITIES = 20;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    let initial: Activity[];

    try {
      initial = saved
        ? JSON.parse(saved).map((a: Activity) => ({
          ...a,
          time: new Date(a.time),
        }))
        : this.getInitialActivities();
    } catch (error) {
      console.error('Failed to parse activities from storage', error);
      initial = this.getInitialActivities();
    }

    this.activitiesSubject = new BehaviorSubject<Activity[]>(initial);
    this.activities$ = this.activitiesSubject.asObservable();
  }

  public logActivity(
    message: string,
    icon: string = 'pi pi-info-circle',
    color: string = 'text-blue-500',
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ): void {
    const activities = this.activitiesSubject.value;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      message,
      time: new Date(),
      icon,
      color,
      type,
    };

    const updated = [newActivity, ...activities].slice(0, this.MAX_ACTIVITIES);
    this.saveActivities(updated);
  }

  private saveActivities(activities: Activity[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
      this.activitiesSubject.next(activities);
    } catch (error) {
      console.error('Failed to save activities to storage', error);
    }
  }

  private getInitialActivities(): Activity[] {
    return [
      {
        id: '1',
        message: 'System Initialized',
        time: new Date(Date.now() - 1000 * 60 * 60),
        icon: 'pi pi-power-off',
        color: 'text-green-500',
        type: 'success',
      },
      {
        id: '2',
        message: 'Default Admin Account active',
        time: new Date(Date.now() - 1000 * 60 * 50),
        icon: 'pi pi-user-check',
        color: 'text-blue-500',
        type: 'info',
      },
    ];
  }
}

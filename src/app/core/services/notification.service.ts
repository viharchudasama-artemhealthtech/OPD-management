import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warn' | 'error';
  timestamp: Date;
  read: boolean;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();

  public readonly unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  constructor(private readonly messageService: MessageService) {
    // Load existing notifications from localStorage if any
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      try {
        this.notificationsSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
  }

  public showSuccess(summary: string, detail: string): void {
    this.addToast('success', summary, detail);
    this.addNotification(summary, detail, 'success', 'pi-check-circle');
  }

  public showError(summary: string, detail: string): void {
    this.addToast('error', summary, detail);
    this.addNotification(summary, detail, 'error', 'pi-exclamation-circle');
  }

  public showInfo(summary: string, detail: string): void {
    this.addToast('info', summary, detail);
    this.addNotification(summary, detail, 'info', 'pi-info-circle');
  }

  public showWarning(summary: string, detail: string): void {
    this.addToast('warn', summary, detail);
    this.addNotification(summary, detail, 'warn', 'pi-exclamation-triangle');
  }

  private addToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 5000,
    });
  }

  private addNotification(title: string, message: string, type: 'success' | 'info' | 'warn' | 'error', icon: string): void {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      icon,
    };

    const updated = [newNotification, ...this.notificationsSubject.value].slice(0, 50); // Keep last 50
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  public markAsRead(id: string): void {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  public clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
  }

  private saveToStorage(notifications: Notification[]): void {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }
}

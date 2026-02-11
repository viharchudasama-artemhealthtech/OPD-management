import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SystemSettings } from '../models/system-settings.model';
export { SystemSettings };
import { SystemSettingsRepository } from '../repositories/system-settings.repository';
import { DataSyncService } from './data-sync.service';

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly settingsSubject: BehaviorSubject<SystemSettings>;
  public readonly settings$: Observable<SystemSettings>;

  constructor(
    private readonly systemSettingsRepository: SystemSettingsRepository,
    private readonly dataSync: DataSyncService,
  ) {
    const initialSettings = this.systemSettingsRepository.getSettings();
    this.settingsSubject = new BehaviorSubject<SystemSettings>(initialSettings);
    this.settings$ = this.settingsSubject.asObservable();

    this.dataSync
      .onKeyUpdate('system_settings')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.settingsSubject.next(this.systemSettingsRepository.getSettings());
      });
  }

  getSettings(): Observable<SystemSettings> {
    return this.settings$;
  }

  updateSettings(settings: SystemSettings): void {
    this.systemSettingsRepository.saveSettings(settings);
    this.settingsSubject.next(settings);
  }

  get systemName(): string {
    return this.settingsSubject.value.general.systemName;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { Subject, fromEvent, merge, Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class DataSyncService implements OnDestroy {

  // Use to clear the memory leaks
  private readonly destroy$ = new Subject<void>();

  // Use to listen the storage update and merge the events which are dispatched by the notifyUpdate method
  private readonly storageUpdateSource$ = merge(
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(map(event => event.key)),
    fromEvent<CustomEvent<string>>(window, 'app:storage_update')
      .pipe(map(event => event.detail)),
  )
    .pipe(
      filter((key): key is string => !!key),
      share(),
      takeUntil(this.destroy$),
    );

  constructor(private readonly logger: LoggerService) { }

  public notifyUpdate(key: string): void {
    window.dispatchEvent(new CustomEvent('app:storage_update', { detail: key }));
  }

  public onKeyUpdate(key: string): Observable<string> {
    return this.storageUpdateSource$.pipe(filter((updatedKey: string) => updatedKey === key));
  }

  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      this.logger.error('DataSyncService', `Error parsing key: ${key}`, e);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyUpdate(key);
    } catch (e) {
      this.logger.error('DataSyncService', `Error saving key: ${key}`, e);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

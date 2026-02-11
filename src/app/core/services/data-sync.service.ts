import { Injectable, OnDestroy } from '@angular/core';
import { Subject, fromEvent, merge, Observable } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

/**
 * Modernized DataSyncService using native storage events and a streamlined polling fallback
 */
@Injectable({
  providedIn: 'root',
})
export class DataSyncService implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  // Core synchronization stream that listens to both native storage events and custom manual triggers
  private readonly storageUpdateSource$ = merge(
    // Native browser event for cross-tab updates
    fromEvent<StorageEvent>(window, 'storage').pipe(map(event => event.key)),
    // Custom event for same-tab manual triggers
    fromEvent<CustomEvent<string>>(window, 'app:storage_update').pipe(map(event => event.detail)),
  ).pipe(
    filter((key): key is string => !!key),
    share(),
    takeUntil(this.destroy$),
  );

  /**
   * Notify the application that a storage key has been updated manually
   */
  public notifyUpdate(key: string): void {
    window.dispatchEvent(new CustomEvent('app:storage_update', { detail: key }));
  }

  /**
   * Get an observable for updates to a specific storage key
   */
  public onKeyUpdate(key: string): Observable<string> {
    return this.storageUpdateSource$.pipe(filter((updatedKey: string) => updatedKey === key));
  }



  /**
   * Helper to get data from localStorage with type safety and error handling
   */
  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`[DataSyncService] Error parsing key: ${key}`, e);
      return defaultValue;
    }
  }

  /**
   * Helper to set data to localStorage and notify listeners
   */
  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyUpdate(key);
    } catch (e) {
      console.error(`[DataSyncService] Error saving key: ${key}`, e);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

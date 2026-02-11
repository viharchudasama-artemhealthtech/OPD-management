/** Angular core dependencies for service lifecycle and dependency injection */
import { Injectable, OnDestroy } from '@angular/core';
/** RxJS dependencies for reactive programming and observables */
import { Subject, fromEvent, merge, Observable } from 'rxjs';
/** RxJS operators for stream transformation */
import { filter, map, share, takeUntil } from 'rxjs/operators';
/** Centralized logging service */
import { LoggerService } from './logger.service';

/**
 * Data Synchronization Service
 * 
 * **Purpose:**
 * Provides centralized, type-safe access to localStorage with cross-tab synchronization.
 * All services should use this instead of direct localStorage access.
 * 
 * **Features:**
 * - Type-safe get/set operations
 * - Automatic JSON serialization/deserialization
 * - Cross-tab synchronization using storage events
 * - Same-tab updates using custom events
 * - Error handling and logging
 * 
 * **Architecture:**
 * Used by all Repository classes to persist data to localStorage.
 * Ensures data consistency across browser tabs.
 */
@Injectable({
  providedIn: 'root',
})
export class DataSyncService implements OnDestroy {

  /** Subject for cleanup on service destruction */
  private readonly destroy$ = new Subject<void>();

  /**
   * Core synchronization stream that listens to both native storage events and custom manual triggers.
   * Combines:
   * - Native browser storage events (cross-tab updates)
   * - Custom app events (same-tab updates)
   */
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
   * Constructor - Injects LoggerService for error logging
   * @param logger - Centralized logging service
   */
  constructor(private readonly logger: LoggerService) { }

  /**
   * Notifies the application that a storage key has been updated manually.
   * This triggers the custom event that other parts of the app can listen to.
   * 
   * @param key - The localStorage key that was updated
   */
  public notifyUpdate(key: string): void {
    window.dispatchEvent(new CustomEvent('app:storage_update', { detail: key }));
  }

  /**
   * Returns an observable that emits whenever a specific storage key is updated.
   * Useful for reactive components that need to respond to data changes.
   * 
   * @param key - The localStorage key to watch
   * @returns Observable that emits the key name when updated
   * 
   * @example
   * this.dataSync.onKeyUpdate('currentUser').subscribe(() => {
   *   // Reload user data
   * });
   */
  public onKeyUpdate(key: string): Observable<string> {
    return this.storageUpdateSource$.pipe(filter((updatedKey: string) => updatedKey === key));
  }

  /**
   * Retrieves data from localStorage with type safety and error handling.
   * Automatically parses JSON and handles errors gracefully.
   * 
   * @template T - The expected type of the stored data
   * @param key - The localStorage key to retrieve
   * @param defaultValue - Value to return if key doesn't exist or parsing fails
   * @returns The parsed data or defaultValue
   * 
   * @example
   * const user = this.dataSync.getItem<User>('currentUser', null);
   */
  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      this.logger.error('DataSyncService', `Error parsing key: ${key}`, e);
      return defaultValue;
    }
  }

  /**
   * Saves data to localStorage and notifies all listeners.
   * Automatically stringifies the value and triggers synchronization events.
   * 
   * @template T - The type of data being stored
   * @param key - The localStorage key to set
   * @param value - The value to store (will be JSON stringified)
   * 
   * @example
   * this.dataSync.setItem('currentUser', user);
   */
  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyUpdate(key);
    } catch (e) {
      this.logger.error('DataSyncService', `Error saving key: ${key}`, e);
    }
  }

  /**
   * Cleanup method called when service is destroyed.
   * Completes all observables to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

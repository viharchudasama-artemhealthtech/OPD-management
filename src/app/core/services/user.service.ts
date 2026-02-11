import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UserRole } from '../models/enums/user-role.enum';
import { UserStatus } from '../models/enums/user-status.enum';
import { AppUser } from '../models/user.model';
import { ActivityService } from './activity.service';
import { DataSyncService } from './data-sync.service';
import { UserRepository } from '../repositories/user.repository';

/**
 * UserService
 *
 * Responsibilities:
 * - Reactive state management via users$ stream
 * - High-level business logic (filtering, logging)
 * - Orchestrating between Repository and Components
 */
@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  private readonly STORAGE_KEY = 'opd_users'; // Keep key for sync listener
  private readonly destroy$ = new Subject<void>();
  private readonly usersSubject = new BehaviorSubject<AppUser[]>([]);

  public readonly users$ = this.usersSubject.asObservable();

  constructor(
    private readonly activityService: ActivityService,
    private readonly dataSync: DataSyncService,
    private readonly userRepository: UserRepository,
  ) {
    // Initial state load
    this.refreshState();

    // Listen for storage changes from other tabs/services
    this.dataSync
      .onKeyUpdate(this.STORAGE_KEY)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshState());
  }

  /**
   * Internal helper to sync BehaviorSubject with Repository
   */
  private refreshState(): void {
    this.usersSubject.next(this.userRepository.getUsers());
  }

  public getUsers(): Observable<AppUser[]> {
    return this.users$;
  }

  public getDoctors(): Observable<AppUser[]> {
    return this.users$.pipe(map(users => users.filter(u => u.role === UserRole.DOCTOR && u.status === UserStatus.ACTIVE)));
  }

  public addUser(user: Partial<AppUser>): Observable<AppUser> {
    const users = this.usersSubject.value;
    const newUser: AppUser = {
      id: user.id || Math.random().toString(36).substr(2, 9).toUpperCase(),
      username: user.username!.toLowerCase().trim(),
      fullName: user.fullName!,
      role: user.role!,
      email: user.email!,
      status: user.status || UserStatus.ACTIVE,
      password: user.password || 'password123',
      token: '',
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.userRepository.saveUsers([...users, newUser]);
    this.refreshState(); // Refresh local state

    this.activityService.logActivity(`User added: ${newUser.fullName}`, 'pi pi-user-plus', 'text-blue-500', 'success');
    return of(newUser);
  }

  public updateUser(id: string, userData: Partial<AppUser>): Observable<AppUser> {
    const users = this.usersSubject.value;
    const index = users.findIndex(u => u.id === id);

    if (index > -1) {
      const updatedUser = { ...users[index], ...userData };
      if (userData.username) {
        updatedUser.username = userData.username.toLowerCase().trim();
      }
      const updatedUsers = [...users];
      updatedUsers[index] = updatedUser;

      this.userRepository.saveUsers(updatedUsers);
      this.refreshState(); // Refresh local state

      this.activityService.logActivity(
        `User updated: ${updatedUser.fullName}`,
        'pi pi-user-edit',
        'text-orange-500',
        'info',
      );
      return of(updatedUser);
    }
    throw new Error('User not found');
  }

  public deleteUser(id: string): Observable<boolean> {
    const users = this.usersSubject.value;
    const userToDelete = users.find(u => u.id === id);
    const filteredUsers = users.filter(u => u.id !== id);

    this.userRepository.saveUsers(filteredUsers);
    this.refreshState(); // Refresh local state

    if (userToDelete) {
      this.activityService.logActivity(
        `User removed: ${userToDelete.fullName}`,
        'pi pi-user-minus',
        'text-red-500',
        'warning',
      );
    }
    return of(true);
  }

  public getUserByUsername(username: string): AppUser | undefined {
    const normalized = username.toLowerCase().trim();
    return this.usersSubject.value.find(u => u.username === normalized);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

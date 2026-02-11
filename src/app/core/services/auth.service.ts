import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRole } from '../models/enums/user-role.enum';
import { UserStatus } from '../models/enums/user-status.enum';
import { UserService } from './user.service';
import { ActivityService } from './activity.service';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable({
    providedIn: 'root',
})

export class AuthService {

    private readonly currentUserSubject: BehaviorSubject<User | null>;
    public readonly currentUser$: Observable<User | null>;

    constructor(
        private readonly userService: UserService,
        private readonly activityService: ActivityService,
        private readonly authRepository: AuthRepository,
    ) {
        const savedUser = this.authRepository.getCurrentUser();
        this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    public get isAuthenticated(): boolean {
        return !!this.currentUserValue;
    }

    public get userRole(): UserRole | null {
        return this.currentUserValue?.role ?? null;
    }

    public login(credentials: { username: string; password: string }): Observable<User> {
        return of(credentials).pipe(
            delay(800),
            map(creds => {
                const user = this.userService.getUserByUsername(creds.username);
                if (user && user.password === creds.password && user.status === UserStatus.ACTIVE) {
                    const { password, ...userWithoutPassword } = user;
                    return {
                        ...userWithoutPassword,
                        token: `mock-jwt-${crypto.randomUUID()}`,
                    };
                }
                throw new Error('Invalid credentials or account inactive');
            }),
            tap(user => {
                this.authRepository.saveCurrentUser(user);
                this.currentUserSubject.next(user);
                this.activityService.logActivity(
                    `Login successful: ${user.fullName}`,
                    'pi pi-sign-in',
                    'text-teal-500',
                    'info',
                );
            }),
        );
    }

    public logout(): void {
        this.authRepository.clearSession();
        this.currentUserSubject.next(null);
        this.activityService.logActivity('Logout successful', 'pi pi-sign-out', 'text-gray-500', 'info');
    }

    public hasRole(roles: UserRole[]): boolean {
        const user = this.currentUserValue;
        return !!user && roles.includes(user.role);
    }

}

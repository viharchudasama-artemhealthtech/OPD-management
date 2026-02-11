import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRole } from '../models/enums/user-role.enum';
import { UserStatus } from '../models/enums/user-status.enum';
import { UserService } from './user.service';
import { ActivityService } from './activity.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private readonly currentUserSubject: BehaviorSubject<User | null>;
    public readonly currentUser$: Observable<User | null>;

    constructor(
        private readonly userService: UserService,
        private readonly activityService: ActivityService,
    ) {
        const savedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<User | null>(savedUser ? this.safeParse(savedUser) : null);
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    private safeParse(data: string): User | null {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to parse user session', error);
            return null;
        }
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
                localStorage.setItem('currentUser', JSON.stringify(user));
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
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.activityService.logActivity('Logout successful', 'pi pi-sign-out', 'text-gray-500', 'info');
    }

    public hasRole(roles: UserRole[]): boolean {
        const user = this.currentUserValue;
        return !!user && roles.includes(user.role);
    }

    public getDoctors(): Observable<User[]> {
        return this.userService.getDoctors().pipe(map(doctors => doctors.map(({ password, ...d }) => d)));
    }
}

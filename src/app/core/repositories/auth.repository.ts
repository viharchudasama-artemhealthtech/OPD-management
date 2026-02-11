import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { DataSyncService } from '../services/data-sync.service';

/**
 * AuthRepository
 * 
 * Responsibilities:
 * - Direct interaction with storage for authentication-related data
 * - Management of the current user session and authentication tokens
 */
@Injectable({
    providedIn: 'root',
})
export class AuthRepository {

    private readonly STORAGE_KEY_USER = 'currentUser';
    private readonly STORAGE_KEY_TOKEN = 'authToken';

    constructor(private readonly dataSync: DataSyncService) { }

    /**
     * Get the current authenticated user from storage
     */
    public getCurrentUser(): User | null {
        return this.dataSync.getItem<User | null>(this.STORAGE_KEY_USER, null);
    }

    /**
     * Persist the current user to storage
     */
    public saveCurrentUser(user: User | null): void {
        this.dataSync.setItem(this.STORAGE_KEY_USER, user);
    }

    /**
     * Get the authentication token
     */
    public getToken(): string | null {
        return this.dataSync.getItem<string | null>(this.STORAGE_KEY_TOKEN, null);
    }

    /**
     * Persist the authentication token
     */
    public saveToken(token: string | null): void {
        this.dataSync.setItem(this.STORAGE_KEY_TOKEN, token);
    }

    /**
     * Clear all authentication data (Logout)
     */
    public clearSession(): void {
        this.saveCurrentUser(null);
        this.saveToken(null);
    }
}

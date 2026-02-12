import { Injectable } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

@Injectable({
    providedIn: 'root',
})
export class AuthRepository {

    private readonly STORAGE_KEY_USER = 'currentUser';
    private readonly STORAGE_KEY_TOKEN = 'authToken';

    constructor(private readonly dataSync: DataSyncService) { }

    public getCurrentUser(): User | null {
        return this.dataSync.getItem<User | null>(this.STORAGE_KEY_USER, null);
    }

    public saveCurrentUser(user: User | null): void {
        this.dataSync.setItem(this.STORAGE_KEY_USER, user);
    }

    public getToken(): string | null {
        return this.dataSync.getItem<string | null>(this.STORAGE_KEY_TOKEN, null);
    }

    public saveToken(token: string | null): void {
        this.dataSync.setItem(this.STORAGE_KEY_TOKEN, token);
    }

    public clearSession(): void {
        this.saveCurrentUser(null);
        this.saveToken(null);
    }
}

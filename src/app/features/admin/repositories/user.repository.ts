import { Injectable } from '@angular/core';
import { AppUser } from '../../../core/models/user.model';
import { MOCK_USERS } from '../../../core/mocks/mock-users';
import { DataSyncService } from '../../../core/services/data-sync.service';

/**
 * UserRepository
 *
 * Responsibilities:
 * - Direct interaction with storage (LocalStorage via DataSyncService)
 * - Initialization of data with mock users
 * - Low-level CRUD operations
 *
 * This layer acts as a "Fake Backend" for the demo.
 */
@Injectable({
    providedIn: 'root',
})

export class UserRepository {

    private readonly STORAGE_KEY = 'opd_users';

    constructor(private dataSync: DataSyncService) {
        this.init();
    }

    /**
     * Initialize storage with mock users if empty
     * Synchronizes existing users with mock data fields (e.g. adding new departments)
     */
    private init(): void {

        const savedUsers = this.dataSync.getItem<AppUser[]>(this.STORAGE_KEY, []);

        if (savedUsers.length === 0) {
            this.saveUsers(MOCK_USERS);
            return;
        }

        // Sync logic: Ensure default accounts have correct fields if they exist
        let changed = false;
        const updatedUsers = [...savedUsers];

        MOCK_USERS.forEach(mockUser => {

            const existingIndex = updatedUsers.findIndex(u => u.username === mockUser.username);

            if (existingIndex === -1) {
                updatedUsers.push(mockUser);
                changed = true;
            } else {
                const existing = updatedUsers[existingIndex];
                // Sync important fields like department or role if missing/changed in mocks
                if ((mockUser.department && !existing.department) || (mockUser.fullName !== existing.fullName)) {
                    updatedUsers[existingIndex] = {
                        ...existing,
                        department: mockUser.department || existing.department,
                        fullName: mockUser.fullName
                    };
                    changed = true;
                }
            }
        });

        if (changed) {
            this.saveUsers(updatedUsers);
        }
    }

    /**
     * Get all users from storage
     */
    public getUsers(): AppUser[] {
        return this.dataSync.getItem<AppUser[]>(this.STORAGE_KEY, MOCK_USERS);
    }

    /**
     * Persist user list to storage
     */
    public saveUsers(users: AppUser[]): void {
        this.dataSync.setItem(this.STORAGE_KEY, users);
    }
}

import { Injectable } from '@angular/core';
import { SystemSettings } from '../models/system-settings.model';
import { DEFAULT_SYSTEM_SETTINGS } from '../mocks/mock-system-settings';
import { DataSyncService } from '../services/data-sync.service';

/**
 * SystemSettingsRepository
 * 
 * Responsibilities:
 * - Direct interaction with storage for system settings
 * - Initialization with default settings if empty
 */
@Injectable({
    providedIn: 'root',
})
export class SystemSettingsRepository {

    private readonly STORAGE_KEY = 'system_settings';

    constructor(private readonly dataSync: DataSyncService) { }

    public getSettings(): SystemSettings {
        return this.dataSync.getItem<SystemSettings>(this.STORAGE_KEY, DEFAULT_SYSTEM_SETTINGS);
    }

    public saveSettings(settings: SystemSettings): void {
        this.dataSync.setItem(this.STORAGE_KEY, settings);
    }
}

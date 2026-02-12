import { Injectable } from '@angular/core';
import { OpdToken, Visit } from '../../../core/models/opd.model';
import { DataSyncService } from '../../../core/services/data-sync.service';

/**
 * OpdRepository
 * 
 * Responsibilities:
 * - Direct interaction with storage (LocalStorage via DataSyncService)
 * - Low-level CRUD operations for OpdToken and Visit entities
 */
@Injectable({
    providedIn: 'root',
})
export class OpdRepository {
    private readonly STORAGE_KEY_TOKENS = 'opd_tokens';
    private readonly STORAGE_KEY_VISITS = 'opd_visits';

    constructor(private readonly dataSync: DataSyncService) { }

    /**
     * Get all tokens from storage
     */
    public getTokens(): OpdToken[] {
        return this.dataSync.getItem<OpdToken[]>(this.STORAGE_KEY_TOKENS, []);
    }

    /**
     * Persist token list to storage
     */
    public saveTokens(tokens: OpdToken[]): void {
        this.dataSync.setItem(this.STORAGE_KEY_TOKENS, tokens);
    }

    /**
     * Get all visits from storage
     */
    public getVisits(): Visit[] {
        return this.dataSync.getItem<Visit[]>(this.STORAGE_KEY_VISITS, []);
    }

    /**
     * Persist visit list to storage
     */
    public saveVisits(visits: Visit[]): void {
        this.dataSync.setItem(this.STORAGE_KEY_VISITS, visits);
    }

    /**
     * Add a single visit
     */
    public addVisit(visit: Visit): void {
        const visits = this.getVisits();
        this.saveVisits([...visits, visit]);
    }
}

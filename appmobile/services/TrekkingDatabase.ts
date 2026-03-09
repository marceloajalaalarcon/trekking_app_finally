import * as SQLite from 'expo-sqlite';

export type CheckinRecord = {
    id?: number;
    qr_data: string;
    type: 'start' | 'cp' | 'end';
    trekking_id: string;
    cp_id: string;
    scanned_at: number;
    synced: number;
};

export type CachedEventRecord = {
    id: string;
    type: 'trekking' | 'standard';
    data: string; // JSON string
    updated_at: number;
};

// Singleton pattern for DB access
class TrekkingDatabase {
    private db: SQLite.SQLiteDatabase | null = null;

    async init() {
        if (!this.db) {
            this.db = await SQLite.openDatabaseAsync('trekking_events.db');
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS checkins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    qr_data TEXT NOT NULL,
                    type TEXT NOT NULL,
                    trekking_id TEXT NOT NULL,
                    cp_id TEXT NOT NULL,
                    scanned_at INTEGER NOT NULL,
                    synced INTEGER DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS cached_events (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    data TEXT NOT NULL,
                    updated_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS cached_my_events (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at INTEGER NOT NULL
                );
            `);
        }
    }

    async saveCheckin(record: Omit<CheckinRecord, 'id' | 'synced'>): Promise<number> {
        if (!this.db) await this.init();
        const result = await this.db!.runAsync(
            'INSERT INTO checkins (qr_data, type, trekking_id, cp_id, scanned_at, synced) VALUES (?, ?, ?, ?, ?, 0)',
            [record.qr_data, record.type, record.trekking_id, record.cp_id, record.scanned_at]
        );
        return result.lastInsertRowId;
    }

    async getUnsyncedCheckins(): Promise<CheckinRecord[]> {
        if (!this.db) await this.init();
        return await this.db!.getAllAsync<CheckinRecord>('SELECT * FROM checkins WHERE synced = 0 ORDER BY scanned_at ASC');
    }

    async markAsSynced(ids: number[]) {
        if (!this.db) await this.init();
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db!.runAsync(`UPDATE checkins SET synced = 1 WHERE id IN (${placeholders})`, ids);
    }

    async getCheckinHistory(trekkingId: string): Promise<CheckinRecord[]> {
        if (!this.db) await this.init();
        return await this.db!.getAllAsync<CheckinRecord>('SELECT * FROM checkins WHERE trekking_id = ? ORDER BY scanned_at DESC', [trekkingId]);
    }

    async hasRegisteredStart(trekkingId: string): Promise<boolean> {
        if (!this.db) await this.init();
        const startCheckin = await this.db!.getFirstAsync<CheckinRecord>(
            "SELECT * FROM checkins WHERE trekking_id = ? AND type = 'start'",
            [trekkingId]
        );
        return !!startCheckin;
    }

    async clearHistory() {
        if (!this.db) await this.init();
        await this.db!.runAsync('DELETE FROM checkins');
    }

    // --- Offline Event Caching ---

    async cacheMyEventsList(eventsJson: string) {
        if (!this.db) await this.init();
        await this.db!.runAsync(
            'INSERT OR REPLACE INTO cached_my_events (id, data, updated_at) VALUES (?, ?, ?)',
            ['my_events_list', eventsJson, Date.now()]
        );
    }

    async getCachedMyEventsList(): Promise<any[] | null> {
        if (!this.db) await this.init();
        const record = await this.db!.getFirstAsync<{ data: string }>(
            "SELECT data FROM cached_my_events WHERE id = 'my_events_list'"
        );
        if (record) return JSON.parse(record.data);
        return null;
    }

    async cacheEventDetails(eventId: string, type: string, eventJson: string) {
        if (!this.db) await this.init();
        await this.db!.runAsync(
            'INSERT OR REPLACE INTO cached_events (id, type, data, updated_at) VALUES (?, ?, ?, ?)',
            [eventId, type, eventJson, Date.now()]
        );
    }

    async getCachedEventDetails(eventId: string): Promise<any | null> {
        if (!this.db) await this.init();
        const record = await this.db!.getFirstAsync<{ data: string }>(
            "SELECT data FROM cached_events WHERE id = ?",
            [eventId]
        );
        if (record) return JSON.parse(record.data);
        return null;
    }
}

export const dbService = new TrekkingDatabase();

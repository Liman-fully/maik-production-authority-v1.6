import { Connection } from 'typeorm';
export declare class IndexMaintenanceService {
    private connection;
    constructor(connection: Connection);
    analyzeTables(): Promise<void>;
    checkSlowQueries(): Promise<void>;
}

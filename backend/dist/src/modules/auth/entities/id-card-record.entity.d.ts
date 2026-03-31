export declare enum AuthRecordType {
    REGISTER = "id_card"
}
export declare class IdCardRecord {
    id: string;
    idCardHash: string;
    registerCount: number;
    createdAt: Date;
}

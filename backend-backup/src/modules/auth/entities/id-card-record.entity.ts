import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index
} from 'typeorm';

export enum AuthRecordType {
  REGISTER = 'id_card',  // identity tied at registration
}

@Entity('id_card_records')
export class IdCardRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'id_card_hash', length: 64 })
  idCardHash: string;  // SHA-256 of idCard, never store plaintext

  @Column({ name: 'register_count', default: 1 })
  registerCount: number;  // Max 3 per idCard

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

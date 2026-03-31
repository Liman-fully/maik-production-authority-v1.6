import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('search_logs')
export class SearchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: number;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;  // { city: '北京', educationLevel: 3, ... }

  @Column({ name: 'result_count', default: 0 })
  resultCount: number;

  @Column({ name: 'clicked_candidate_id', nullable: true })
  clickedCandidateId: number;

  @Column({ name: 'contacted_candidate_id', nullable: true })
  contactedCandidateId: number;

  @Column({ name: 'response_time_ms', nullable: true })
  responseTimeMs: number;

  @Column({ name: 'cache_hit', default: false })
  cacheHit: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}

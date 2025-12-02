import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Repository } from '../../repositories/entities/repository.entity';

@Entity('users')
export class User {
  @PrimaryColumn('bigint')
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @OneToMany(() => Repository, (repository) => repository.user, {
    cascade: true,
  })
  repositories: Repository[];
}

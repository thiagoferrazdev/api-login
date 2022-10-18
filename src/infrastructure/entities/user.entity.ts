import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column('varchar', { unique: true })
  username: string;

  @Column('text')
  password: string;

  @UpdateDateColumn({ name: 'updateddate' })
  updateddate: Date;

  @Column('varchar', { nullable: true })
  hach_refresh_token: string;
}

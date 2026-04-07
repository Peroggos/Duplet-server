import { User } from 'src/moduls/user/entities/user.entity';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  Index 
} from 'typeorm';


export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
}

@Entity('portfolio_items')
@Index(['user_id', 'order'])
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  media_url: string; 

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  media_type: MediaType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.portfolio_items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
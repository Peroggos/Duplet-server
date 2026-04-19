import { IsDateString } from "class-validator";
import { User } from "src/moduls/user/entities/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";


@Entity('Swipe')
export class Card {

    @PrimaryColumn('uuid')
    id: string

    @Column()
    title: string

    @Column({ name: 'user_id' })
    user_id: string
    
    @Column()
    targetUserId: string
    @ManyToOne(() => User, (user) => user.card)
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ default: false})
    isLike?: boolean

    @Column({ default: false})
    isDislike?: boolean
    @IsDateString()
    createAt: Date
  @Column({ type: 'date', nullable: true })
  @Index()
  expiresAt: Date;
}


/* user : bio, 

portfolio */
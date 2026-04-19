import { User } from "src/moduls/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";


@Entity("Match")
@Index(['user_id_1', 'user_id_2'])
export class Match {
    @PrimaryColumn("uuid")
    id: string

    @Column()
    targetUserId: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'targetUserId' })
    targetUser: User

    @ManyToOne(() => User)
    @JoinColumn({name:'user_id_1'})
    user1: User
    @Column()
    user_id_1: string

    @ManyToOne(() => User)
    @JoinColumn({name:'user_id_2'})
    user2: User
    @Column()
    user_id_2: string

    @Column({ default: 'active' })
    status: string; // 'active' | 'archived' | 'blocked'

    @Column({ nullable: true })
    lastMessageAt: Date;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}

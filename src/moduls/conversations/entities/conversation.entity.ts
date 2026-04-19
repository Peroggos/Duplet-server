
import { Massage } from "src/moduls/massages/entities/massage.entity";
import { User } from "src/moduls/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('conversation')
export class Conversation {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true})
    name: string

    @Column({default: true})
    isGroup: boolean
    //  TODO Разрабраться как работать с miniO or S3 пока опциональная штука
    // @Column({ nullable: true})
    // groupAvatar: string

    @ManyToMany(() => User, user => user.conversations)
    participants: User[]

    @OneToMany(() => Massage, massage => massage.conversation)
    massage: Massage[]

    @Column({ type: 'jsonb', nullable: true })
    lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
    }
    @CreateDateColumn()
    createdAt: Date
        
    @UpdateDateColumn()
    updatedAt: Date
}

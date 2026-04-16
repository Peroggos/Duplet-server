import { User } from "src/moduls/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";


@Entity('Swipe')
export class Card {

    @PrimaryColumn('uuid')
    id: string

    @Column()
    title: string

    @Column({ name: 'user_id' })
    user_id: string

    @OneToOne(() => User, (user) => user.card)
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ default: false})
    isLike?: boolean

    @Column({ default: false})
    isDislike?: boolean
}


/* user : bio, 

portfolio */
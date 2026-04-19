import { Portfolio } from "src/moduls/portfolio/entities/portfolio.entity";
import { Category } from "../../category/entities/category.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, } from "typeorm";
import { Massage } from "src/moduls/massages/entities/massage.entity";
import { Conversation } from "src/moduls/conversations/entities/conversation.entity";
import { Card } from "src/moduls/card/entities/card.entity";



@Entity("User")
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({   unique: true   })
    email: string
    //TODO Пока бета функция она есть но не где не испоьзуеться
    @Column({default:false})
    isOnline: boolean

    @Column({ nullable: true })
    username: string

    @Column()
    password: string

    @Column({ nullable: true })
    bio?: string

    @Column({ nullable: true })
    avatar?: string

//Зависимости юзера

    @ManyToMany(() => Category, (category) => category.user, {   onDelete:'CASCADE',  })
    categories: Category[]

    @OneToMany(() => Portfolio, (portfolio) => portfolio.user, { cascade: true, eager: false})
    portfolio: Portfolio[]

    
    @OneToMany(() => Massage, (messages) => messages.sender)
    sentMessages: Massage[]

    @ManyToMany(() => Conversation,(conversations) => conversations.participants)
    conversations: Conversation[]

    @OneToMany(() => Card,(card) => card.user)
    card: Card[]

    @CreateDateColumn()
    createdAt: Date

    @Column({ nullable: true })
    lastLoginAt: Date;

}

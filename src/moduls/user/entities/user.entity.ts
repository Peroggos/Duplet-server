import { Portfolio } from "src/moduls/portfolio/entities/portfolio.entity";
import { Category } from "../../category/entities/category.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Massage } from "src/moduls/massages/entities/massage.entity";
import { Conversation } from "src/moduls/conversations/entities/conversation.entity";



@Entity("User")
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({   unique: true   })
    email: string
    //TODO Пока бета функция она есть но не где не испоьзуеться
    @Column({default:false})
    isOnline: boolean

    @Column()
    username: string

    @Column()
    password: string

    @Column()
    bio?: string

    @Column()
    avatar: string

//Зависимости юзера

    @OneToMany(() => Category, (category) => category.user, {   onDelete:'CASCADE',  })
    categories: Category[]

    @OneToMany(() => Portfolio, (portfolio_items) => portfolio_items.user, { cascade: true, eager: false})
    portfolio_items: Portfolio[]

    
    @OneToMany(() => Massage, (messages) => messages.sender)
    sentMessages: Massage[]
    @ManyToMany(() => Conversation,(conversations) => conversations.participants)
    conversations: Conversation[]
    
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date


}

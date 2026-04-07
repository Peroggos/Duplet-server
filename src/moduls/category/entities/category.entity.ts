import { User } from "src/moduls/user/entities/user.entity";
import { Column, 
    CreateDateColumn, 
    Entity, JoinColumn, 
    ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity()
export class Category {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    label: string

    @Column({ nullable: true })
    icon?: string

    @ManyToOne(() => User, (user) => user.categories)
    @JoinColumn({   name: 'user_id'})
    user: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}


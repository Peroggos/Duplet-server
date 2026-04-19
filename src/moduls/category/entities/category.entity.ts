import { User } from "src/moduls/user/entities/user.entity";
import { Column, 
    CreateDateColumn, 
    Entity, JoinColumn, 
    JoinTable, 
    ManyToMany, 
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

    @ManyToMany(() => User, (user) => user.categories)
    @JoinTable({
        name: 'user_categories', // имя промежуточной таблицы
        joinColumn: {
            name: 'category_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    user: User[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}


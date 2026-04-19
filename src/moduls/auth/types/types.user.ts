import { Category } from "src/moduls/category/entities/category.entity"

export interface IUser{
    id:string
    email: string
    category: Category[] 
    password: string
}
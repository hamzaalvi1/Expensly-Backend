import {hash, genSalt,compare} from "bcryptjs";

export const hashPassword = async (password:string):Promise<string> => 
    await hash(password, await genSalt(10));

export const verifyPassword = async (password:string, hashedPassword:string):Promise<boolean> => 
    await compare(password, hashedPassword);
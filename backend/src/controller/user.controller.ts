import type { Request, Response } from 'express';
import {registerSchema, loginSchema, updateProfileSchema, changePasswordSchema} from '../schema/user.schema.ts';
import * as userServices from '../services/user.service.ts';

export const register = async (req:Request, res:Response)=>{
    try{
       const result = registerSchema.safeParse(req.body);
       if(!result.success){
         return res.status(400).json({message: result.error.issues[0]?.message, error: result.error})
       }
       await userServices.registerFeature(result.data);
       res.status(201).json({message:"register Succesfull"})
    }
    catch(error: any){
      if(error.code === 11000){
        return res.status(400).json({message:"Phone number or email already in use"})
      }
      res.status(500).json({message:"Somethign went wrong"})
    }
}

export const login = async (req:Request, res: Response)=>{
    try{
      const result = loginSchema.safeParse(req.body);
      if(!result.success){
        return res.status(400).json({error: result.error})
      }
      const {token, role} = await userServices.loginFeature(result.data);
      res.status(200).json({message:"Login Succesfull", token, role})
    }
    catch(error: any){
       res.status(400).json({message:error.message})
    }
}

export const getOwnProfile = async (req: Request, res: Response) => {
    try {
        const profile = await userServices.getOwnProfileFeature(req.userId as string)
        res.status(200).json(profile)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const result = updateProfileSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        const profile = await userServices.updateProfileFeature(req.userId as string, result.data)
        res.status(200).json(profile)
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already in use" })
        }
        res.status(400).json({ message: error.message })
    }
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const result = changePasswordSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        await userServices.changePasswordFeature(req.userId as string, result.data)
        res.status(200).json({ message: "Password changed successfully" })
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}
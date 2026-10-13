import User from '../models/user.model.ts'
import type {RegisterData, LoginData, UpdateProfileData, ChangePasswordData} from '../schema/user.schema.ts'
import {hash, compare} from 'bcrypt-ts'
import jwt from 'jsonwebtoken'

export const registerFeature = async (data:RegisterData)=>{
    const hashedPassword= await hash(data.password,10);
    const user = await User.create({
        ...data,
        email: data.email || undefined,
        password: hashedPassword
    });
    return user;
}

export const loginFeature = async (data:LoginData)=>{
    const user = await User.findOne({
        $or: [{phoneNumber: data.identifier}, {email:data.identifier}]
    }).select('+password');

    if(!user) throw new Error('User Not Found');
    const match = await compare(data.password,user.password);
    if (!match) throw new Error('invalid password');

    const token = jwt.sign(
        {id: user._id, role: user.role},
        process.env.JWT_SECRET!,
        {expiresIn: '7d'}
    )

    return {token, role: user.role};
}

export const getOwnProfileFeature = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
}

export const updateProfileFeature = async (userId: string, data: UpdateProfileData) => {
    const update = data.email
        ? { email: data.email }
        : { $unset: { email: '' } };
    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!user) throw new Error('User not found');
    return user;
}

export const changePasswordFeature = async (userId: string, data: ChangePasswordData) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const match = await compare(data.currentPassword, user.password);
    if (!match) throw new Error('Current password is incorrect');

    user.password = await hash(data.newPassword, 10);
    await user.save();
}
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { RegisterInput } from '../types/auth.types';
import { UserUpdateInput } from '../types/user.types';

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: RegisterInput = req.body;
    const newUser = await UserService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: `User not found with id ${userId}` });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const userData: UserUpdateInput = req.body;
    const updatedUser = await UserService.updateUser(userId, userData);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.UserWhereInput | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    const users = await UserService.getUsers(page, limit, sortBy, sortOrder);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    await UserService.deleteUser(userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
};

export default {
  createUser,
  getUserById,
  updateUser,
  getUsers,
  deleteUser,
};

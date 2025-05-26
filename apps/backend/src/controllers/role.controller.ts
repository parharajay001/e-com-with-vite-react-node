import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import roleService from '../services/role.service';
import { DatabaseError } from '../utils/errors';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.RoleWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
    const includeDeleted = req.query.includeDeleted === 'true';

    const roles = await roleService.getRoles(page, limit, sortBy, sortOrder, includeDeleted);
    res.json(roles);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const role = await roleService.updateRole(roleId, req.body);
    res.json(role);
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'NOT_FOUND') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message, code: error.code });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    await roleService.deleteRole(roleId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'NOT_FOUND') {
        res.status(404).json({ error: error.message });
      } else if (error.code === 'ROLE_IN_USE') {
        res.status(400).json({ error: error.message, details: error.details });
      } else {
        res.status(400).json({ error: error.message, code: error.code });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};

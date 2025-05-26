import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { DatabaseError } from '../utils/errors';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.ProductCategoryWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const categories = await categoryService.getCategories(page, limit, sortBy, sortOrder);
    res.json(categories);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(categoryId);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await categoryService.updateCategory(categoryId, req.body);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteCategoryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryImageUrl = req.body.imageUrl;

    if (!categoryImageUrl) {
      res.status(400).json({ error: 'No Category Image Url Found' });
      return;
    }

    const category = await categoryService.deleteCategoryImage(categoryId, categoryImageUrl);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateCategoryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const oldImageUrl = req.body.oldImageUrl as string | '';
    const categoryId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    //remove images from folder
    if (oldImageUrl) {
      try {
        const filePath = path.join(__dirname, '..', '..', oldImageUrl);
        await fs.promises.unlink(filePath);
      } catch {
        //todo: handle error
      }
    }

    // Get the relative path from the uploads directory
    const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
    const imageUrl = `/uploads${relativePath}`;

    const category = await categoryService.updateCategory(categoryId, {
      imageUrl: imageUrl,
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    await categoryService.deleteCategory(categoryId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === 'NOT_FOUND') {
        res.status(404).json({ error: error.message });
      } else if (error.code === 'CONSTRAINT_VIOLATION') {
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
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryImage,
  updateCategoryImage,
};

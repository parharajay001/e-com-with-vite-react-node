import { Request, Response } from 'express';
import variantService from '../services/variant.service';
import { DatabaseError } from '../utils/errors';

export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const variants = await variantService.getVariantsByProductId(productId);
    res.json(variants);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    const variant = await variantService.createVariant(productId, req.body);
    res.status(201).json(variant);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const variantId = parseInt(req.params.variantId);
    const variant = await variantService.updateVariant(variantId, req.body);
    res.json(variant);
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

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const variantId = parseInt(req.params.variantId);
    await variantService.deleteVariant(variantId);
    res.status(204).send();
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

export default {
  getProductVariants,
  createVariant,
  updateVariant,
  deleteVariant,
};

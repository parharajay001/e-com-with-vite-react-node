import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import productService from '../services/product.service';
import { DatabaseError } from '../utils/errors';
import { getGoogleDriveFileId } from '../utils/helper';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as keyof Prisma.ProductWhereInput;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const products = await productService.getProducts(page, limit, sortBy, sortOrder);
    res.json(products);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productService.getProductById(productId);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productService.updateProduct(productId, req.body);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    await productService.deleteProduct(productId);
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

export const updateProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    const images = req.body.imageUrls
      ? Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : [req.body.imageUrls]
      : [];
    const imageUrls = images.map((url: string) => ({
      imageUrl: url.startsWith('https://drive.google.com')
        ? `https://drive.usercontent.google.com/download?id=${getGoogleDriveFileId(url)}`
        : url,
    }));

    if (!imageUrls && (!files || files.length === 0)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Convert the uploaded files to image URLs
    const productImages = files.map((file) => ({
      imageUrl: `/uploads/images/product/${productId}/${file.filename}`,
    }));

    const product = await productService.updateProductImages(productId, [
      ...(productImages || []),
      ...(imageUrls || []),
    ]);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const deleteProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    const productImages = req.body.images as { imageUrl: string }[];

    if (!productImages || productImages.length === 0) {
      res.status(400).json({ error: 'No Product Images Found' });
      return;
    }

    const product = await productService.deleteProductImages(productId, productImages);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImages,
  deleteProductImages,
};

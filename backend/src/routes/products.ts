import { Router, Response } from 'express';
import { ProductModel } from '../models/Product';
import { AuthRequest, protect, admin } from '../middleware/auth';

const router = Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    const page = Number(req.query.page) || 1;
    const category = req.query.category as string;
    
    const result = await ProductModel.findAll(keyword, page, 12, category);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error });
  }
});

// Obtener categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await ProductModel.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error });
  }
});

// Crear producto (admin)
router.post('/', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    const product = await ProductModel.create({
      name, description, price, image, category, stock
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error });
  }
});

// Actualizar producto (admin)
router.put('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await ProductModel.update(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error });
  }
});

// Eliminar producto (admin)
router.delete('/:id', protect, admin, async (req: AuthRequest, res: Response) => {
  try {
    await ProductModel.delete(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error });
  }
});

export default router;

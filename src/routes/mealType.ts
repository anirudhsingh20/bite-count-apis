import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: ['breakfast', 'lunch','snack', 'dinner']
  });
});

export default router;
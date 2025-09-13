import { Router } from 'express';
import { TagController } from '../controllers/tagController';

const router = Router();
const tagController = new TagController();

// Basic CRUD operations
// GET /api/v1/tags - Get all tags with pagination
router.get('/', tagController.getAllTags);

// GET /api/v1/tags/:id - Get tag by ID
router.get('/:id', tagController.getTagById);

// POST /api/v1/tags - Create new tag
router.post('/', tagController.createTag);

// PUT /api/v1/tags/:id - Update tag
router.put('/:id', tagController.updateTag);

// DELETE /api/v1/tags/:id - Delete tag
router.delete('/:id', tagController.deleteTag);

// Search and filter operations
// GET /api/v1/tags/search - Search tags with filters
router.get('/search', tagController.searchTags);

// GET /api/v1/tags/stats - Get tag statistics
router.get('/stats', tagController.getTagStats);

// Special endpoints
// GET /api/v1/tags/active - Get all active tags
router.get('/active', tagController.getActiveTags);

// GET /api/v1/tags/category/:category - Get tags by category
router.get('/category/:category', tagController.getTagsByCategory);

// Additional info endpoints
// GET /api/v1/tags/:id/info - Get detailed tag info
router.get('/:id/info', tagController.getTagInfo);

export default router;

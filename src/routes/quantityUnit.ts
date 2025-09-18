import { Router } from 'express';
import { QuantityUnitController } from '../controllers/quantityUnitController';

const router = Router();
const quantityUnitController = new QuantityUnitController();

// Create quantity unit
router.post('/', (req, res) => quantityUnitController.createQuantityUnit(req, res));

// Get all quantity units with pagination
router.get('/', (req, res) => quantityUnitController.getAllQuantityUnits(req, res));

// Search quantity units
router.get('/search', (req, res) => quantityUnitController.searchQuantityUnits(req, res));

// Get quantity unit by ID
router.get('/:id', (req, res) => quantityUnitController.getQuantityUnitById(req, res));

// Get quantity unit by name
router.get('/name/:name', (req, res) => quantityUnitController.getQuantityUnitByName(req, res));

// Get quantity unit by short name
router.get('/short/:shortName', (req, res) => quantityUnitController.getQuantityUnitByShortName(req, res));

// Get quantity unit statistics
router.get('/stats/overview', (req, res) => quantityUnitController.getQuantityUnitStats(req, res));

// Update quantity unit
router.put('/:id', (req, res) => quantityUnitController.updateQuantityUnit(req, res));

// Delete quantity unit
router.delete('/:id', (req, res) => quantityUnitController.deleteQuantityUnit(req, res));

export default router;

import express, { Router } from 'express';
import { createRole, deleteRole, getRoles, updateRole } from '../controllers/role.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createRoleSchema, updateRoleSchema } from '../validators/role.validators';

const router: Router = express.Router();

router.get('/', getRoles);
router.post('/', validateRequest(createRoleSchema), createRole);
router.put('/:id', validateRequest(updateRoleSchema), updateRole);
router.delete('/:id', deleteRole);

export default router;

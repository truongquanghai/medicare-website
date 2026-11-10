import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import appointmentRoutes from './appointment.routes.js';
import authRoutes from './auth.routes.js';
import catalogRoutes from './catalog.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', name: 'MediCare API' }));
router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use(catalogRoutes);

export default router;

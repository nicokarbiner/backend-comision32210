import { Router } from 'express'
import {
  getUsers,
  deleteInactiveUsers,
  updateRole,
  deleteUser,
  deleteUserByEmail,
  uploadDocuments,
  updateUser,
} from '../controllers/users.controller.js'
import { passportCall, authorization } from '../middleware/auth.js'
import { uploader } from '../services/multer.js'

const router = Router()

router.get('/', passportCall('current'), authorization(['admin']), getUsers)
router.delete('/', passportCall('current'), authorization(['admin']), deleteInactiveUsers)
router.put('/:email', passportCall('current'), authorization(['admin']), updateUser)
router.put('/premium/:uid', passportCall('current'), authorization(['user',  'premium']), updateRole)
router.post('/:uid/documents', passportCall('current'), authorization(['user', 'premium']), uploader.array('file'), uploadDocuments)
router.delete('/email/:email', deleteUserByEmail)
router.delete('/:uid', deleteUser)

export default router
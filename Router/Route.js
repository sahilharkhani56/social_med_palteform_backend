import { Router } from "express"
const router=Router()
import * as controller from '../controlers/appControlers.js'
router.route('/information').post(controller.Information)
router.route('/connections').post(controller.Connections)

router.route('/allusers/:id').get(controller.getAllUsers)
router.route('/user/:username').get(controller.getUser)


export default router;
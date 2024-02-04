import { Router } from "express"
const router=Router()
import * as controller from '../controlers/appControlers.js'
router.route('/information').post(controller.Information)
router.route('/connections').post(controller.Connections)
router.route('/editInformation').post(controller.editProfile)
router.route('/post').post(controller.createPost)
router.route('/getpost/:id').get(controller.getPosts)
router.route('/allusers/:id').get(controller.getAllUsers)
router.route('/user/:username').get(controller.getUser)
router.route('/getCurrentuserPost/:id').get(controller.getCurrentUserPost)


export default router;
import { Router } from "express";
import UserModel from "../dao/models/user.model.js";

const router = Router()

// Middleware
function logged(req, res, next) {
    if(!req.session?.user) {
        return next()
    } else {
        return res.status(400).json({status: 'error', payload: 'already logged in'})
    }
}
function requireAuth(req, res, next) {
    if(req.session?.user) {
        return next()
    } else {
        return res.status(401).json({status: 'error', payload: 'not authenticated'})
    }
}

// Crear usuarios en la DB
router.post('/register', logged, async( req, res) => {
    const newUser = req.body

    const user = new UserModel(newUser)
    await user.save()

    res.json({status: 'success', payload: 'Register successful'})
})

// Login
router.post('/login', logged, async (req, res) => {

    const { email, password } = req.body

    if(email === 'testing@coderhouse.com' && password === 'Testing2023') {
        const admin = {
            email,
            password,
            first_name: 'Testing',
            last_name: 'Coderhouse',
            age: 20,
            role: 'admin'
        }
        req.session.user = admin
        res.json({status: 'success', payload: admin})
    } else {
        const user = await UserModel.findOne({email, password}).lean().exec()
        if(!user) {
            return res.status(401).json({status: 'error', payload: 'Error en usuario y/o contraseña'})
        }

        req.session.user = user
        res.json({status: 'success', payload: 'Login successful'})}
})

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            res.status(500).json({status: 'error', payload: err})
        } else res.json({status: 'success', payload: 'Logged out'})
    })
})

// Perfil del usuario
router.get('/user', requireAuth, (req, res) => {
    const user = req.session.user

    if(!user) {
        return res.status(404).render('errors/base', {
            error: 'User not found'
        })
    }

    res.json({status: 'success', payload: user})
})


export default router
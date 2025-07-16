import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'

const router = express.Router()

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// Sign Up
router.post('/sign-up', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body
    
    // Check fields aren't empty
    if (username.trim() === '') return res.send('Please provide a username.')
    if (password.trim() === '') return res.send('Please provide a password.')

    // Use the req.body to check whether the username already exists
    const existingUser = await User.findOne({ username: username })
    if (existingUser) return res.send('Username already taken. Please try another.')

    // Check passwords match
    if (password !== confirmPassword) return res.send('Passwords do not match.')

    // Create the user
    const user = await User.create(req.body)

    // Modify the session for the user to include information about the user account
    // The presence of a req.session.user will indicate that the user is authenticated
    req.session.user = {
      _id: user._id,
      username: user._id
    }

    req.session.save(() => {
      // Redirect to the sign in page
      return res.redirect('/')
    })
    
  } catch (error) {
    console.log(error)
    return res.send(error.message)
  }
})

// Sign In
router.post('/sign-in', async (req, res) => {
  try {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username: username })
    if (!existingUser) return res.send('Invalid credentials provided.')

    // Check if the passwords match. If they DONT, fail on a 401
    if (!bcrypt.compareSync(password, existingUser.password)) {
      return res.send('Invalid credentials provided.')
    }

    req.session.user = {
      _id: existingUser._id,
      username: existingUser._id
    }

    req.session.save(() => {
      // Redirect to the sign in page
      return res.redirect('/')
    })

  } catch (error) {
    console.log(error)
    return res.send(error.message)
  }
})

// Sign Out
router.get('/sign-out', (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect('/auth/sign-in')
    })
  } catch (error) {
    console.log(error)
    return res.send(error.message)
  }
})


export default router

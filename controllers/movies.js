




import express from 'express'
import Listing from '../models/movie.js'
import isSignedIn from '../middleware/isSignedIn.js'

const router = express.Router()


// Controllers go here

// * Index route
// Path: /movies
// Method: GET
// Purpose: Display ALL movies
router.get('', async (req, res, next) => {
  try {
    const movies = await movie.find()
    return res.render('movies/index.ejs', { movies })
  } catch (error) {
    next(error)
  }
})

// * New route
// Path: /movies/new
// Method: GET
// Purpose: Render a form that will allow a user to POST a create movie request
router.get('/new', isSignedIn, (req, res, next) => {
  try {
    return res.render('movies/new.ejs')
  } catch (error) {
    next(error)
  }
})

// * Show route
// Path: /movies/:movieId
// Method: GET
// Purpose: Display a single movie
router.get('/:movieId', async (req, res, next) => {
  try {
    const { movieId } = req.params
    const movie = await movie.findById(movieId).populate('owner')
    return res.render('movies/show.ejs', { movie })
  } catch (error) {
    next(error)
  }
})


// * Create route
// Path: /movies
// Method: POST
// Purpose: Process the form and create a movie in the database
router.post('', isSignedIn, async (req, res, next) => {
  try {
    // Assign the owner field on the req.body as the logged in user (req.session.user)
    req.body.director = req.session.user._id

    // Create a movie using the modified req.body
    const newmovie = await movie.create(req.body)

    // Add a success flash message
    req.session.message = `Your movie at ${newmovie.title} was created successfully.`

    // Redirect away
    return res.status(201).redirect(`/movies/${newmovie._id}`)
  } catch (error) {
    error.renderForm = true
    error.renderPath = '/movies/new'
    next(error)
  }
})

// * Delete route
// Path: /movies/:movieId
// Method: DELETE
// Purpose: Delete a single movie from the database
router.delete('/:movieId', isSignedIn, async (req, res, next) => {
  try {
    const { movieId } = req.params
    const movieToDelete = await movie.findById(movieId)
    
    // To implement authorization, we need to ensure only the owner of the movie can delete it
    // The below if statement checks the logged in user id (req.session.user._id) against the owner field on the movie
    // If they match, the user is authorized to delete the movie
    // If they do not (as the condition states) we want to send an error response
    if (!movieToDelete.owner.equals(req.session.user._id)) {
      return res.status(403).send('not allowed')
    }

    // Delete the movie from the db (works in a similar way to findByIdAndDelete)
    await movieToDelete.deleteOne()

    // Redirect back to the movies index
    return res.redirect('/movies')
  } catch (error) {
    next(error)
  }
})


// * Edit Form route
// Path: /movies/:movieId/edit
// Method: GET
// Purpose: Render the edit form for a movie
router.get('/:movieId/edit', isSignedIn, async (req, res, next) => {
  try {
    const { movieId } = req.params
    const movie = await movie.findById(movieId)

    if (!movie.director.equals(req.session.user._id)) {
      return res.status(403).send('not allowed')
    }
    return res.render('movies/edit.ejs', { movie })
  } catch (error) {
    next(error)
  }
})


// * Update route
// Path: /movies/:movieId
// Method: PUT
// Purpose: Update a movie in the database
router.put('/:movieId', isSignedIn, async (req, res, next) => {
  try {
    const { movieId } = req.params
    const movieToDelete = await movie.findById(movieId)

    if (!movieToDelete.owner.equals(req.session.user._id)) {
      return res.status(403).send('not allowed')
    }

    await movie.findByIdAndUpdate(movieId, req.body)

    return res.redirect(`/movies/${movieId}`)
  } catch (error) {
    next(error)
  }
})



// Export the router
export default router







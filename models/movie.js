import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema ({
    title: { type: String , required: true},
    genre: {type: String, required: true},
    releaseYear: {type: Number, required: true},
    description: {type: String, required: true},
    price:{type: Number, required: true},
    director: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}


})

const movie = mongoose.model('Movie',MovieSchema)

export default movie
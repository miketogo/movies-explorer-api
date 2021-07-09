const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const InvalidDataError = require('../errors/invalid-data-err');
const NotEnoughRightsError = require('../errors/not-enough-rights-err');

// const opts = {
//   new: true,
//   runValidators: true,
// };

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.status(200).send({ movies }))
    .catch(next);
};

module.exports.saveMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные при сохранении фильма');
      }
    })
    .catch(next);
};

module.exports.deleteMovieById = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  return Movie.findById(movieId).orFail(() => new Error('NotFound'))
    .then((movieById) => {
      if (movieById.owner.equals(userId)) {
        return Movie.findByIdAndRemove(movieId).orFail(() => new Error('NotFound'))
          .then((movie) => res.status(202).send({ movie }))
          .catch(next);
      }
      throw new Error('NotEnoughRights');
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет фильма с таким id');
      }
      if (err.message === 'NotEnoughRights') {
        throw new NotEnoughRightsError('Недостаточно прав для удаления чужого фильма');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные для удаления фильма');
      }
    })
    .catch(next);
};

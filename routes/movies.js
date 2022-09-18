const express = require("express");
const { Genres } = require("../models/genres");
const router = express.Router();
const { Movies, validate } = require("../models/movies");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", async (req, res) => {
  const movies = await Movies.find().populate("genre");
  res.send(movies);
});

router.get("/:id", async (req, res) => {
  try {
    const movies = await Movies.findById(req.params.id).populate("genre");
    res.send(movies);
  } catch {
    res.status(404).send(`Cannot find with given id : ${req.body.id}`);
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genres.findById(req.body.genre);
  if (!genre)
    return res.status(400).send(`Invalid Genre id : ${req.body.genre}`);

  const movies = new Movies({
    title: req.body.title,
    genre: req.body.genre,
    numberInstock: req.body.numberInstock,
    dailyRentalRate: req.body.dailyRentalRate,
  });
  await movies.save();
  res.send(movies);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const movies = await Movies.updateOne(
    { _id: req.params.id },
    {
      $set: {
        title: req.body.title,
        genre: req.body.genre,
        numberInstock: req.body.numberInstock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
    },
    { new: true }
  );
  res.send(movies);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const movies = await Movies.deleteOne({ _id: req.params.id });
  res.send(movies);
});

module.exports = router;

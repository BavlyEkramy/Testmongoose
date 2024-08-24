const express = require("express");
const auth = require("../middleware/auth");
const Article = require("../models/article");

const router = express.Router();

router.post("/articles", auth, async (req, res) => {
  try {
    const article = new Article({ ...req.body, owner: req.user._id });
    await article.save();
    res.status(200).send(article);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/articles", auth, async (req, res) => {
  try {
    const articles = await Article.find({ owner: req.user._id });
    // const articles = await Article.find({});
    res.status(200).send(articles);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/articles/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const article = await Article.findOne({ _id: id, owner: req.user._id });
    if (!article) {
      return res.status(400).send("This article does not belong to you");
    }
    res.status(200).send(article);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/articles/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const article = await Article.findOneAndUpdate(
      { _id, owner: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!article) {
      return res.status(404).send("No article");
    }
    await article.save();
    res.status(200).send(article);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.delete("/articles/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const article = await Article.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    if (!article) {
      res.status(400).send("This article does not belong to you");
    }
    res.status(200).send(article);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;

const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

///////////////////////////////////////////////////////////////////////////////////////////
// get
router.get("/users", auth, (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});
////////////////////////////////////////////////////////////////////////////////////////////
// to get by id

router.get("/users/:id", auth, (req, res) => {
  const _id = req.params.id;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send("Unable to find user");
      }
      res.status(200).send(user);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});
////////////////////////////////////////////////////////////////////////////////////////////
// patch

router.patch("/users/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const _id = req.params.id;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send("No user is found");
    }

    updates.forEach(async (ele) => {
      if (ele != "password") {
        user[ele] = req.body[ele];
      } else {
        const bcryptjs = require("bcryptjs");
        const compare = await bcryptjs.compare(req.body[ele], user[ele]);
        console.log(compare);
        if (!compare) user[ele] = req.body[ele];
      }
    });

    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////
// delete

router.delete("/users/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return res.status(404).send("Unable to find user");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////
// login :
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////

router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////
// Profile

router.get("/profile", auth, async (req, res) => {
  res.status(200).send(req.user);
});

////////////////////////////////////////////////////////////////////////////////////////////
// logout

router.delete("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((item) => {
      return item !== req.token;
    });
    await req.user.save();
    rs.status(200).send("done");
  } catch (e) {
    res.status(500).send(e);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////
// logoutAll
router.delete("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    rs.status(200).send("done");
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;

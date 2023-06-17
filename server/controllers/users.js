const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { getUserById } = require('../utils/api_helper');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(200).json(user);
});

usersRouter.post('/', async (req, res) => {
  const name = req.body.name || 'Incognito';
  const { username, password } = req.body;
  if (!(username && password))
    return res.status(400).json({ error: 'username/password not given' });
  else if (username.length < 3)
    return res
      .status(400)
      .json({ error: 'username must be at least 3 characters long' });
  else if (password.length < 5)
    return res
      .status(400)
      .json({ error: 'password must be at least 5 characters long' });
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const createdUser = await new User({ username, name, passwordHash }).save();
  res.status(201).json(createdUser);
});

usersRouter.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const userToUpdate = await getUserById(userId);
  if (!userToUpdate) return res.status(404).json('invalid/nonexistent user id');

  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token not given' });
  if (user.id !== userToUpdate.id)
    return res.status(401).json({
      error: 'wrong/invalid token (not authorised)'
    });

  const { updatedUserData } = req.body;
  const { toUpdate } = req.body;
  if (toUpdate === 'name') {
    if (updatedUserData.password || updatedUserData.username !== user.username)
      return res.status(400).json({
        error: 'cannot update name + password/username simultaneously'
      });

    if (!updatedUserData.name.trim())
      return res
        .status(400)
        .json({ error: 'new name must not be an empty string/whitespace' });

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true
    });
    return res.status(200).json(updatedUser);
  } else if (toUpdate === 'username') {
    if (updatedUserData.password || updatedUserData.name !== user.name)
      return res.status(400).json({
        error: 'cannot update username + password/name simultaneously'
      });

    if (updatedUserData.username.length < 3)
      return res
        .status(400)
        .json({ error: 'new username must be at least 3 characters long' });

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true
    });
    return res.status(200).json(updatedUser);
  } else if (toUpdate === 'password') {
    if (
      updatedUserData.name !== user.name ||
      updatedUserData.username !== user.username
    )
      return res.status(400).json({
        error: 'cannot update password + name/username simultaneously'
      });

    if (updatedUserData.password.length < 5)
      return res
        .status(400)
        .json({ error: 'new password must be at least 5 characters long' });

    const saltRounds = 10;
    const { password } = updatedUserData;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...updatedUserData, passwordHash },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  }
  res.status(400).json({
    error:
      "invalid update flag (toUpdate must either be set to 'name', 'username' or 'password'"
  });
});

usersRouter.delete('/:id', async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token not given' });
  else if (user.id !== req.params.id)
    return res.status(401).json({ error: 'invalid token/user id' });
  const deletedUser = await User.findByIdAndDelete(user.id);
  res.status(200).json(deletedUser);
});

module.exports = usersRouter;

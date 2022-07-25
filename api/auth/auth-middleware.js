const Users = require('../users/users-model');

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  console.log('restricted ping')
  if(req.session.loggedInUser == null){
    next({status: 401, message: 'You shall not pass!'})
    return;
  }
  next()
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  try{
    const { username } = req.body;
    const result = await Users.findBy({ username }).first()
    if(result){
      next({status: 422, message: 'Username taken'})
      return
    }
    next()
  } catch(err){
    next(err)
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  try{
    const { username } = req.body;
    const result = await Users.findBy({ username }).first()
    if(result == null){
      next({status: 401, message: 'Invalid credentials'})
      return
    }
    req.user = result
    next()
  } catch(err){
    next(err)
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  const { password } = req.body;
  if(typeof password !== 'string' || password.trim().length < 4){
    next({status: 422, message: 'Password must be longer than 3 chars'})
    return
  }
  next()
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}

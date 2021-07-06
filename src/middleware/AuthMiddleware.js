import jwt from 'jsonwebtoken';

const AuthMiddleware = (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization) {
    req.error = "No authentication header found."
    req.isAuth = false
    return next()
  }

  let decoded

  try {
    const token = authorization.split(' ')[1]
    decoded = jwt.verify(token, process.env.JWT_KEY)
  } catch (error) {
    req.isAuth = false
    req.error = error.message
    return next()
  }

  if (!decoded) {
    req.isAuth = false
    req.error = "Unable to decode jwt"
    return next()
  }

  req.isAuth = true
  req.user = decoded
  req.error = null
  next()
}

export default AuthMiddleware
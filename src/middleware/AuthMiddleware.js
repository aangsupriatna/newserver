import jwt from 'jsonwebtoken';

const AuthMiddleware = async (req, res, next) => {
  const { authorization } = req.headers
  // console.log(req.headers)
  if (!authorization) {
    req.error = "No authentication header found."
    req.isAuth = false
    return next()
  }

  let decoded

  try {
    const token = authorization.split(' ')[1]
    // console.log(token)
    decoded = await jwt.verify(token, process.env.JWT_KEY)
    // console.log(decoded)
  } catch (error) {
    req.isAuth = false
    req.error = error.message
    // console.log(error.message)
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
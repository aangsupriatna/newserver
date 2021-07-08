import jwt from 'jsonwebtoken';

const AuthMiddleware = async (req, res, next) => {
  const { authorization } = req.headers
  console.log(authorization)
  if (!authorization) {
    req.error = "No authentication header found."
    req.isAuth = false
    return next()
  }

  let decoded

  try {
    // const token = accestoken.split(' ')[1]
    decoded = await jwt.verify(authorization, process.env.JWT_KEY)
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
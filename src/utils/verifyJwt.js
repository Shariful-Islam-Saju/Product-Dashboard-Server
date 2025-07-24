export const verifyJwt = (req, res)  => {
  res.status(200).json({
    message: "Verify successful"
  })
}
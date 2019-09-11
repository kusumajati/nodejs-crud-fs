module.exports = (req, res, next)=>{
    var user1 = "Fulan"
    req.test = user1
    next()
}
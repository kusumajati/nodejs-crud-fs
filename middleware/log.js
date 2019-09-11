module.exports= (req, res, next)=>{
    console.log("User: " +req.test+ ", method: " +req.method+ " to path: "+ req.path)
    // res.send('hello from log middleware')
    next()
}

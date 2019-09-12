//set PORT to be deployed to heroku (BELUM DI BAHAS..)
const PORT = process.env.PORT||3001

const express = require('express')
const app = express()
const uuid = require('uuid')
var users = require('./user.json')
const bodyParser = require('body-parser')
const fs = require('fs')

//log Middleware (ganti nama dari 'user' ke 'userMiddleware')
const userMiddleware = require('./middleware/user')
const log = require("./middleware/log")

const multer = require('multer')
//require nodejs 'path' to name the file uploaded according to the original extension
const path = require('path')


app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'))


//set multer destination folder to path 'public' & to name the file uploaded to have extension using 'path.extname()' method
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  // create middleware 'upload' to be called in upload handler
  var upload = multer({ storage: storage })


// upload handler,  using 'upload' middleware, tak ganti methodnya jadi 'patch' biar lebih masuk akal 
app.patch('/upload/:id',  upload.single('avatar'), (req,res)=>{
    var findIndex = users.findIndex(user => user.id === req.params.id)
    if(findIndex>-1){
       // express' res.redirect to pass the 'req.file.filename'as params to be handled
        res.redirect('/patch-image/'+req.params.id+"/"+req.file.filename)
    }else{
        res.json({
            success:false,
            message:"user not found"
        })
    }
})
//handle upload image using params passed from '/upload/:id'
app.get('/patch-image/:id/:imageId', (req,res)=>{
    var findIndex = users.findIndex(user => user.id === req.params.id)
    if(findIndex>-1){
        var pushed = {
            id: users[findIndex].id,
            name: users[findIndex].name,
            email: users[findIndex].email, 
            nohp:  users[findIndex].nohp,
            image: req.params.imageId
        }
        users.splice(findIndex, 1, pushed)
        fs.writeFile("user.json", JSON.stringify(users), (err) => {
            if (err) {
                res.json({
                    success: false,
                    message: "fail to create user",
                    data: err
                })
            } else {
                res.json({
                    success: true,
                    message: "image updated",
                    data: pushed
                })
            }
        })
    }else{
        res.json({
            success:false,
            message:"user not found"
        })
    }

})


app.get('/', function (req, res) {    
    res.send('Hellow world!')
})

app.get('/user', userMiddleware,log,  (req, res) => {
    res.send(users)
})
app.get('/user/:id', (req, res) => {
    var user = users.find(user => user.id === req.params.id)
    if (user) {
        res.json({
            success: true,
            message: "user get by id",
            data: user
        })
    } else {
        res.json({
            success: false,
            message: "user not found",
        })
    }
})
app.post('/user',(req, res) => {
    var pushed = { 
        name: req.body.name,
         nohp: req.body.nohp, 
         email: req.body.email, 
         id: uuid(), 
         //tak tambahin default avatar pake 'UI-Avatars API'
         image: "https://ui-avatars.com/api/?name="+req.body.name
        }
    users = [...users, pushed]
    fs.writeFile("user.json", JSON.stringify(users), (err) => {
        if (err) {
            res.json({
                success: false,
                message: "fail to create user",
                data: err
            })
        } else {
            res.json({
                success: true,
                message: "new user created",
                data: pushed
            })
        }
    })

})
app.delete('/user/:id', (req, res) => {
    var findIndex = users.findIndex(user => user.id === req.params.id)
    if (findIndex > -1) {
        users.splice(findIndex, 1)

        res.json({
            success: true,
            message: "user has been deleted"
        })
    } else {
        res.json({
            success: false,
            message: "user not found"
        })
    }
})

app.put('/user/:id', (req, res) => {
    var pushed = { id: req.params.id, name: req.body.name, email: req.body.email, nohp: req.body.nohp }
    var findIndex = users.findIndex(user => user.id === req.params.id)
    if (findIndex > -1) {
        users.splice(findIndex, 1, pushed)
        fs.writeFile("user.json", JSON.stringify(users), (err) => {
            if (err) {
                res.send(err)
            } else {
                res.json({
                    success: true,
                    message: "user has been updated"
                })
            }
        })

    } else {
        res.json({
            success: false,
            message: "user not found"
        })
    }
})

app.patch('/user/:id', (req, res) => {
    var findIndex = users.findIndex(user => user.id === req.params.id)
    if (findIndex > -1) {
        var pushed = {
            id: req.params.id, name: req.body.name || users[findIndex].name,
            email: req.body.email || users[findIndex].email, nohp: req.body.nohp || users[findIndex].nohp
        }

        users.splice(findIndex, 1, pushed)
        fs.writeFile("user.json", JSON.stringify(users), (err) => {
            if (err) {
                res.send(err)
            } else {
                res.json({
                    success: true,
                    message: "user has been updated"
                })
            }
        })

    } else {
        res.json({
            success: false,
            message: "user not found"
        })
    }
})

// EJS, BELUM DI BAHAS..
app.get('/user/show/:id', (req,res)=>{
    var user = users.find(user => user.id === req.params.id)
    if (user) {
        res.render("UserShow.ejs",{user:user})
    } else {
        res.json({
            success: false,
            message: "user not found",
        })
    }
})

app.listen(PORT, () => console.log(`server started, listening on port ${PORT}`))
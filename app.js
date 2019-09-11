
const app = require('express')()
const PORT = 3001
const uuid = require('uuid')
var users = require('./user.json')
const bodyParser = require('body-parser')
const fs = require('fs')

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.get('/', function (req, res) {
    // console.log("Hello World")
    res.send('Hello World')
})
app.get('/write-file-sync', (req, res) => {
    fs.writeFile("text.js", "Hello World2", (err) => {
        if (err) {
            res.send(err)
        } else {
            res.send("success")
        }
    })
})
app.get('/user', (req, res) => {
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
app.post('/user', (req, res) => {
    var pushed = { name: req.body.name, nohp: req.body.nohp, email: req.body.email, id: uuid() }
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

app.listen(PORT, () => console.log(`server started, listening on port ${PORT}`))
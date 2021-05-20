let http = require('http'),
express = require('express'),
app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const Sentim = require('./model/sentim');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(cors());

const JWT_SECRET = 'randomstuffisthekey'

mongoose.connect('mongodb://localhost:27017/myapi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

app.use(bodyParser.json());

app.options('/users', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.end();
});

app.get('/users', async (req, res) => {
    const { email: username, password } = req.query
    const user = await User.findOne({ username }).lean()

    if(!user) {
        res.status(201)
        return res.json({ status: 'error', error: 'Usuário ou senha inválidos.'})
    }

    if(await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({
            id: user._id,
            username: user.username
        },
        JWT_SECRET
        )
        return res.json({ status: 'ok', data: token })
    }
    
    res.status(201)
    res.json({ status: 'error', error: 'Usuário ou senha inválidos.'})
});

app.post('/users', async (req, res) => {
    const { email: username, password: plainTextPassword } = req.body
    const password = await bcrypt.hash(plainTextPassword, 10)

    try{
        const response = await User.create({
            username,
            password
        })
        console.log(response)
    } catch(error) {
        if(error.code === 11000){
            res.status(201)
            return res.json({ status: 'error', error: 'Usuário já cadastrado.' })
        }
        throw error
    }
    res.json({ status: 'ok' })
});

app.post('/sentim', async (req, res) => {
    const { text, type, polarity } = req.body

    try{
        const response = await Sentim.create({
            text,
            type,
            polarity
        })
        console.log(response)
    } catch(error) {
        throw error
    }
    res.json({ status: 'ok' })
});

app.listen(3000);
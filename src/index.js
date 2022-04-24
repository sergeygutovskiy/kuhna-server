import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import UserController from './controllers/UserController';
import jsonwebtoken from 'jsonwebtoken';
import ServiceController from './controllers/ServiceController';

const app = express();
app.use(cors({
    origin: '*'
}))
app.use(bodyParser.json());

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if ( !token ) return res.sendStatus(401);

    try {
        const info = jsonwebtoken.verify(token, 'secret');
        req.user = info.data;
        next();
    } catch (e) {
        return res.sendStatus(400);
    }
}

app.post('/users/register', UserController.register);
app.post('/users/login', UserController.login);
app.get('/users/account', auth, UserController.account);
app.put('/users/account', auth, UserController.update);
app.get('/users/account/services', auth, UserController.accountServices);

app.get('/services', ServiceController.all);
app.post('/services', auth, ServiceController.create);
app.delete('/services/:id', auth, ServiceController.remove);
app.put('/services/:id', auth, ServiceController.update);

const PORT = 3000; 
app.listen(PORT, () => console.log(`listening on port ${PORT}.`));
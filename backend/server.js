const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = '123456789';
const expiresIn = '1h';


function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
}


function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err);
}

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(middlewares);


server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    const user = router.db.get('users').find({ email, password }).value();

    if (!user) {
        const status = 401;
        const message = 'Incorrect email or password';
        return res.status(status).json({ status, message });
    }


    const token = createToken({ id: user.id, email: user.email, role: user.role });


    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });
});


server.get('/auth/me', (req, res) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        return res.status(status).json({ status, message });
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        const verifyTokenResult = verifyToken(token);

        if (verifyTokenResult instanceof Error) {
            const status = 401;
            const message = 'Access token not provided or invalid';
            return res.status(status).json({ status, message });
        }

        const userId = verifyTokenResult.id;
        const user = router.db.get('users').find({ id: userId }).value();

        if (!user) {
            return res.status(401).json({ status: 401, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);

    } catch (err) {
        const status = 401;
        const message = 'Error access_token is revoked';
        res.status(status).json({ status, message });
    }
});


server.use((req, res, next) => {

    if (req.path.startsWith('/auth')) {
        return next();
    }


    if (req.method === 'GET' && req.path.startsWith('/resources')) {
        return next();
    }


    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        return res.status(status).json({ status, message });
    }

    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401;
            const message = 'Access token not provided or invalid';
            return res.status(status).json({ status, message });
        }
        next();
    } catch (err) {
        const status = 401;
        const message = 'Error access_token is revoked';
        res.status(status).json({ status, message });
    }
});


server.use((req, res, next) => {
    if (req.method === 'DELETE' && req.path.startsWith('/resources/')) {
        const resourceId = parseInt(req.path.split('/').pop());

        if (!isNaN(resourceId)) {
            const tickets = router.db.get('tickets').filter({ resourceId: resourceId }).value();
            if (tickets.length > 0) {
                return res.status(409).json({
                    status: 409,
                    message: 'Cannot delete resource because it has associated tickets.'
                });
            }
        }
    }
    next();
});

server.use(router);

server.listen(3000, () => {
    console.log('Run Auth API Server');
});

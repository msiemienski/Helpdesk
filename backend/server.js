const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = '123456789';
const expiresIn = '1h';

// Helper to create token
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Helper to verify token
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err);
}

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(middlewares);

// Custom route: Login
server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Find user in db
    const user = router.db.get('users').find({ email, password }).value();

    if (!user) {
        const status = 401;
        const message = 'Incorrect email or password';
        return res.status(status).json({ status, message });
    }

    // Create token
    const token = createToken({ id: user.id, email: user.email, role: user.role });

    // Return user info (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });
});

// Custom route: Me
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

// Auth Middleware protection - Global
server.use((req, res, next) => {
    // Allow auth routes
    if (req.path.startsWith('/auth')) {
        return next();
    }

    // Need authorization for everything else
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

        // Check ticket access
        // If getting tickets, apply filtering based on role
        if (req.method === 'GET' && (req.path === '/tickets' || req.path === '/tickets/')) {
            const userRole = verifyTokenResult.role;
            const userId = verifyTokenResult.id;

            if (userRole === 'user') {
                // Modify query to only return own tickets
                // json-server allows filtering via query params. 
                // We can force it here by modifying req.query
                req.query.userId = userId.toString();
            }
        }

        next();
    } catch (err) {
        const status = 401;
        const message = 'Error access_token is revoked';
        res.status(status).json({ status, message });
    }
});

server.use(router);

server.listen(3000, () => {
    console.log('Run Auth API Server');
});

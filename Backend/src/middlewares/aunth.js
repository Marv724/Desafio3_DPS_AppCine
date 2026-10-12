import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, rol }
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
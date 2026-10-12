import jst from "jsonwebtoken";

export const auth = (req, res, siguiente) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer') ? header.slice(7) : null;
    if(token) {
        return res.status(401).json({message: 'Token es requerido'});
    }
    try{
        req.user = jst(token, process.env.JWT_SECRET);
        siguiente();
    }
    catch{
        res.status(401).json({message: 'El token es invalido o se encuentra expirado'})
    }
};
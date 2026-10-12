export const soloRol = (rol) => (req, res, next) => {
    if(req.user?.rol != rol){
        return res.status(403).json({message: 'No tiene permitido esta accion'});
    }
    next();
}
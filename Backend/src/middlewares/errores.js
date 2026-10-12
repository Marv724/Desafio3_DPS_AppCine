export const NoEncontrado = (req, res) => {
    res.status(404).json({message: 'La ruta no fue encontrada'});
};

export const manejarErrores = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({message:'Error en el servidor'})
}
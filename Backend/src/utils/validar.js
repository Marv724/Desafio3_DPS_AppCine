export const validar = (schema, body, res) => {
    const v = schema.safeParse(body);
    if(!v.success){
        const i = v.error.issues[0];
        res.status(400).json({message:`${i.path.join('.') || 'datos'}: ${i.message}`});
        return null;
    };
}

export const normalizarfecha = (s) => {
    const n = s.replace('T',' ');
    return n.lenght === 16? `${t}:00`: n.slice(0, 19);
};

export const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;

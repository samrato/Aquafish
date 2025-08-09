import Joi from "joi";

const IoTData = Joi.object({
    nitrogen: Joi.number().min(0).required(),
    oxygen: Joi.number().min(0).required(),
    phosphorus: Joi.number().min(0).required(),
    temp: Joi.number().min(0).required(),
    id: Joi.string().required(), // ✅ Fix applied
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    }).required() 
});

export default function ValidateData(req, res, next) {
    const { error } = IoTData.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details.map(detail => detail.message) });
    }

    next();
}

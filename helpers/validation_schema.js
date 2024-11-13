const Joi = require('joi');

const authSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().min(10),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});


const qrSchema = Joi.object({
  message: Joi.string().min(3).required(),
  options: Joi.required(),
});

const contactRequestSchema = Joi.object({
  qr_code_id: Joi.number().required(),
  reason: Joi.string().min(3).required(),
});

module.exports = {
  authSchema,
  loginSchema,
  qrSchema,
  contactRequestSchema,
};

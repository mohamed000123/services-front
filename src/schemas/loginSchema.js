import * as yup from 'yup'

/** Mirrors `loginWithEmailValidator` on the backend (express-validator). */
export const loginSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Email must be a valid email address'),

  password: yup
    .string()
    .typeError('Password must be a string')
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number'),
})

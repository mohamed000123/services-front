import { useEffect } from 'react'
import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '@/services/auth.js'
import { isAuthenticated } from '@/services/api.js'
import { loginSchema } from '@/schemas/loginSchema.js'
import { getApiErrorMessages } from '@/utils/getApiErrorMessages.js'

const inputClass =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-violet-500/0 transition focus:ring-2 focus:ring-violet-500/20 dark:bg-zinc-950 dark:text-zinc-100'
const inputNormal =
  'border-zinc-200 focus:border-violet-500 dark:border-zinc-700'
const inputError =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'

export function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) navigate('/monitor', { replace: true })
  }, [navigate])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setStatus }) => {
      setStatus(undefined)
      try {
        await loginAdmin({ email: values.email.trim(), password: values.password })
        navigate('/monitor', { replace: true })
      } catch (err) {
        setStatus({ apiErrors: getApiErrorMessages(err) })
      }
    },
  })

  const apiErrors = formik.status?.apiErrors ?? []
  const emailInvalid = formik.touched.email && formik.errors.email
  const passwordInvalid = formik.touched.password && formik.errors.password

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-[400px] rounded-2xl border border-zinc-200 bg-white p-8 shadow-[var(--shadow)] dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-1 text-center text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          sign in
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Use the credentials issued by your backend administrator.
        </p>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={emailInvalid ? 'true' : 'false'}
              aria-describedby={emailInvalid ? 'login-email-error' : undefined}
              className={`${inputClass} ${emailInvalid ? inputError : inputNormal}`}
            />
            {emailInvalid ? (
              <p id="login-email-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                {formik.errors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={passwordInvalid ? 'true' : 'false'}
              aria-describedby={passwordInvalid ? 'login-password-error' : undefined}
              className={`${inputClass} ${passwordInvalid ? inputError : inputNormal}`}
            />
            {passwordInvalid ? (
              <p id="login-password-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                {formik.errors.password}
              </p>
            ) : null}
          </div>

          {apiErrors.length > 0 ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {apiErrors.length === 1 ? (
                <p className="m-0">{apiErrors[0]}</p>
              ) : (
                <ul className="m-0 list-disc space-y-1 pl-4">
                  {apiErrors.map((m, i) => (
                    <li key={i} className="pl-0.5">
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-1 inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

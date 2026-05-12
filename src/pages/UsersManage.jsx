import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { ListPagination } from '@/components/ui/ListPagination.jsx'
import { api } from '@/services/api.js'
import { getApiErrorMessages } from '@/utils/getApiErrorMessages.js'

const DEFAULT_META = { page: 1, limit: 20, total: 0 }

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {import('react').MouseEventHandler<HTMLButtonElement>} [props.onClick]
 * @param {'zinc' | 'violet' | 'red'} [props.tone]
 * @param {boolean} [props.disabled]
 * @param {'button' | 'submit' | 'reset'} [props.type]
 */
function Btn({ children, onClick = undefined, tone = 'zinc', disabled = false, type = 'button' }) {
  const tones = {
    zinc: 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100',
    violet: 'border-violet-200 bg-violet-600 text-white hover:bg-violet-700 dark:border-violet-700',
    red: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

export function UsersManage() {
  const [clients, setClients] = useState([])
  const [meta, setMeta] = useState(DEFAULT_META)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [modal, setModal] = useState(null)
  const [pwdModal, setPwdModal] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  useLayoutEffect(() => {
    setPage(1)
  }, [debouncedQ])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data } = await api.get('/admin/clients', {
        params: {
          search: debouncedQ || undefined,
          searchBy: 'fullName',
          limit,
          page,
        },
      })
      const list = Array.isArray(data?.data) ? data.data : []
      setClients(list)
      const m = data?.meta
      if (m && typeof m === 'object') {
        setMeta({
          page: Number(m.page) || page,
          limit: Number(m.limit) || limit,
          total: Number(m.total) || 0,
        })
      } else {
        setMeta({ page, limit, total: list.length })
      }
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · ') || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, page, limit])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const lim = Number(meta.limit) || limit
    const total = Number(meta.total) || 0
    const tp = Math.max(1, Math.ceil(total / lim) || 1)
    if (page > tp) {
      setPage(tp)
    }
  }, [meta.limit, meta.total, page, limit])

  const setLimitAndReset = useCallback((n) => {
    setLimit(n)
    setPage(1)
  }, [])

  const clientSchema = useMemo(() => {
    if (!modal) {
      return Yup.object({
        fullName: Yup.string().strip(),
        email: Yup.string().strip(),
        phone: Yup.string().strip(),
        password: Yup.string().strip(),
      })
    }
    if (modal.mode === 'edit') {
      return Yup.object({
        fullName: Yup.string().trim().min(1).max(128).required(),
        email: Yup.string().trim().email().required(),
        phone: Yup.string().trim().min(6).max(32).required(),
      })
    }
    return Yup.object({
      fullName: Yup.string().trim().min(1).max(128).required(),
      email: Yup.string().trim().email().required(),
      phone: Yup.string().trim().min(6).max(32).required(),
      password: Yup.string().min(8).required(),
    })
  }, [modal])

  const form = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
    validationSchema: clientSchema,
    onSubmit: async (values, { resetForm, setStatus }) => {
      setStatus(undefined)
      try {
        if (modal?.mode === 'create') {
          await api.post('/admin/clients', {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            password: values.password,
          })
        } else if (modal?.mode === 'edit' && modal.id) {
          await api.put(`/admin/clients/${modal.id}`, {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
          })
        }
        resetForm()
        setModal(null)
        await load()
      } catch (e) {
        setStatus({ api: getApiErrorMessages(e) })
      }
    },
    enableReinitialize: true,
  })

  useEffect(() => {
    if (modal?.mode === 'edit' && modal.row) {
      form.setValues({
        fullName: modal.row.fullName ?? '',
        email: modal.row.email ?? '',
        phone: modal.row.phone ?? '',
        password: '',
      })
    } else if (modal?.mode === 'create') {
      form.setValues({ fullName: '', email: '', phone: '', password: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  const input =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

  const remove = async (id) => {
    if (!window.confirm('Permanently delete this client?')) return
    try {
      await api.delete(`/admin/clients/${id}`)
      await load()
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · '))
    }
  }

  const pwdForm = useFormik({
    initialValues: { password: '' },
    validationSchema: Yup.object({ password: Yup.string().min(8).required() }),
    onSubmit: async (values, { resetForm, setStatus }) => {
      setStatus(undefined)
      if (!pwdModal?.id) return
      try {
        await api.patch(`/admin/clients/${pwdModal.id}/password`, { password: values.password })
        resetForm()
        setPwdModal(null)
        await load()
      } catch (e) {
        setStatus({ api: getApiErrorMessages(e) })
      }
    },
  })

  const heading = useMemo(
    () => (
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Directory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">Users</h1>
        </div>
        <Btn tone="violet" onClick={() => setModal({ mode: 'create' })}>
          Add user
        </Btn>
      </header>
    ),
    [],
  )

  return (
    <div className="space-y-8">
      {heading}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="users-search" className="sr-only">
          Search users
        </label>
        <input
          id="users-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by full name…"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:max-w-xs"
        />
        <p className="text-xs font-medium text-zinc-500">
          {loading ? 'Searching…' : `${meta.total} total`}
        </p>
      </div>

      {err ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {clients.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-white">{row.fullName}</h2>
            <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">{row.email}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{row.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={() => setModal({ mode: 'edit', id: row.id, row })}>Edit</Btn>
              <Btn onClick={() => setPwdModal({ id: row.id, label: row.fullName })}>Password</Btn>
              <Btn tone="red" onClick={() => void remove(row.id)}>
                Delete
              </Btn>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <th className="px-4 py-3 lg:px-5">Name</th>
                <th className="px-4 py-3 lg:px-5">Email</th>
                <th className="px-4 py-3 lg:px-5">Phone</th>
                <th className="px-4 py-3 text-right lg:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {clients.map((row) => (
                <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white lg:px-5">{row.fullName}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 lg:px-5">{row.email}</td>
                  <td className="px-4 py-3 lg:px-5">{row.phone}</td>
                  <td className="px-4 py-3 text-right lg:px-5">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Btn onClick={() => setModal({ mode: 'edit', id: row.id, row })}>Edit</Btn>
                      <Btn onClick={() => setPwdModal({ id: row.id, label: row.fullName })}>Password</Btn>
                      <Btn tone="red" onClick={() => void remove(row.id)}>
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ListPagination
        page={page}
        limit={limit}
        total={meta.total}
        onPageChange={setPage}
        onLimitChange={setLimitAndReset}
        disabled={loading}
      />

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {modal.mode === 'create' ? 'New client' : 'Edit client'}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={form.handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="cl-name">
                  Full name
                </label>
                <input id="cl-name" name="fullName" className={input} value={form.values.fullName} onChange={form.handleChange} />
                {form.errors.fullName ? <p className="mt-1 text-xs text-red-600">{form.errors.fullName}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="cl-email">
                  Email
                </label>
                <input id="cl-email" name="email" type="email" className={input} value={form.values.email} onChange={form.handleChange} />
                {form.errors.email ? <p className="mt-1 text-xs text-red-600">{form.errors.email}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="cl-phone">
                  Phone
                </label>
                <input id="cl-phone" name="phone" className={input} value={form.values.phone} onChange={form.handleChange} />
                {form.errors.phone ? <p className="mt-1 text-xs text-red-600">{form.errors.phone}</p> : null}
              </div>
              {modal.mode === 'create' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="cl-pw">
                    Password
                  </label>
                  <input
                    id="cl-pw"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={input}
                    value={form.values.password}
                    onChange={form.handleChange}
                  />
                  {form.errors.password ? <p className="mt-1 text-xs text-red-600">{form.errors.password}</p> : null}
                </div>
              ) : null}
              {form.status?.api?.length ? <p className="text-xs text-red-600">{form.status.api.join(' · ')}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Btn type="button" onClick={() => setModal(null)}>
                  Cancel
                </Btn>
                <Btn type="submit" tone="violet" disabled={form.isSubmitting}>
                  Save
                </Btn>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {pwdModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Set password · {pwdModal.label}</h3>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                void pwdForm.handleSubmit()
              }}
            >
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="npw">
                  New password
                </label>
                <input
                  id="npw"
                  name="password"
                  type="password"
                  className={input}
                  value={pwdForm.values.password}
                  onChange={pwdForm.handleChange}
                />
                {pwdForm.errors.password ? <p className="mt-1 text-xs text-red-600">{pwdForm.errors.password}</p> : null}
              </div>
              {pwdForm.status?.api?.length ? <p className="text-xs text-red-600">{pwdForm.status.api.join(' · ')}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Btn type="button" onClick={() => setPwdModal(null)}>
                  Cancel
                </Btn>
                <Btn type="submit" tone="violet" disabled={pwdForm.isSubmitting}>
                  Update
                </Btn>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

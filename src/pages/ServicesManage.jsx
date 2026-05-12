import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { api } from '@/services/api.js'
import { getApiErrorMessages } from '@/utils/getApiErrorMessages.js'
import { ListPagination } from '@/components/ui/ListPagination.jsx'
import { CatalogTextBtn } from '@/features/catalog/CatalogTextBtn.jsx'
import { catalogFetchJson, isArchivedCatalogRow } from '@/features/catalog/catalogHelpers.js'

const DEFAULT_META = { page: 1, limit: 20, total: 0 }

/** Categories loaded in one batch for labels + form (API max limit 100 per request). */
const CATEGORY_LOOKUP_LIMIT = 100

export function ServicesManage() {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [meta, setMeta] = useState(DEFAULT_META)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [err, setErr] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [svcModal, setSvcModal] = useState(null)
  const hasLoadedOnceRef = useRef(false)

  const load = useCallback(async () => {
    const silent = hasLoadedOnceRef.current
    if (!silent) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setErr(null)
    const catLookupParams = { limit: CATEGORY_LOOKUP_LIMIT, page: 1, includeDeleted: showDeleted }
    const svcParams = { limit, page, includeDeleted: showDeleted }
    try {
      const [cRes, sRes] = await Promise.all([
        catalogFetchJson('/admin/catalog/categories', { params: catLookupParams }),
        catalogFetchJson('/admin/catalog/services', { params: svcParams }),
      ])
      setCategories(Array.isArray(cRes?.data) ? cRes.data : [])
      const svcList = Array.isArray(sRes?.data) ? sRes.data : []
      setServices(svcList)
      const m = sRes?.meta
      if (m && typeof m === 'object') {
        setMeta({
          page: Number(m.page) || page,
          limit: Number(m.limit) || limit,
          total: Number(m.total) || 0,
        })
      } else {
        setMeta({ page, limit, total: svcList.length })
      }
      hasLoadedOnceRef.current = true
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · ') || 'Failed to load')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showDeleted, page, limit])

  useEffect(() => {
    void load()
  }, [load])

  useLayoutEffect(() => {
    setPage(1)
  }, [showDeleted])

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

  const catById = useMemo(() => {
    const m = new Map()
    for (const c of categories) m.set(c.id, c.name)
    return m
  }, [categories])

  const activeCategories = useMemo(
    () => categories.filter((c) => !isArchivedCatalogRow(c)),
    [categories],
  )
  const activeServices = useMemo(
    () => services.filter((s) => !isArchivedCatalogRow(s)),
    [services],
  )
  const archivedServices = useMemo(
    () => services.filter((s) => isArchivedCatalogRow(s)),
    [services],
  )
  const selectableCategories = useMemo(
    () => categories.filter((c) => !isArchivedCatalogRow(c)),
    [categories],
  )

  const serviceForm = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      isActive: true,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(1).max(128).required(),
      description: Yup.string().max(512).nullable(),
      price: Yup.number().typeError('Price required').positive().required(),
      categoryId: Yup.string().uuid().required(),
      isActive: Yup.boolean(),
    }),
    onSubmit: async (values, { resetForm, setStatus }) => {
      setStatus(undefined)
      try {
        const payload = {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          price: Number(values.price),
          categoryId: values.categoryId,
          isActive: Boolean(values.isActive),
        }
        if (svcModal?.mode === 'edit') {
          await api.put(`/admin/catalog/services/${svcModal.id}`, payload)
        } else {
          await api.post('/admin/catalog/services', payload)
        }
        resetForm()
        setSvcModal(null)
        await load()
      } catch (e) {
        setStatus({ api: getApiErrorMessages(e) })
      }
    },
    enableReinitialize: true,
  })

  useEffect(() => {
    if (svcModal?.mode === 'edit' && svcModal.row) {
      const r = svcModal.row
      serviceForm.setValues({
        name: r.name ?? '',
        description: r.description ?? '',
        price: String(r.price ?? ''),
        categoryId: r.categoryId ?? r.category?.id ?? '',
        isActive: Boolean(r.isActive),
      })
    } else if (svcModal?.mode === 'create') {
      serviceForm.setValues({
        name: '',
        description: '',
        price: '',
        categoryId: selectableCategories[0]?.id ?? '',
        isActive: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svcModal, selectableCategories])

  const deleteService = async (id) => {
    if (!window.confirm('Soft-delete this service?')) return
    try {
      await api.delete(`/admin/catalog/services/${id}`)
      await load()
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · '))
    }
  }

  const restoreService = async (id) => {
    try {
      await api.patch(`/admin/catalog/services/${id}/restore`)
      await load()
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · '))
    }
  }

  const input =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Catalog
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Services
          </h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              className="size-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600"
              checked={showDeleted}
              disabled={refreshing}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Show deleted
            {refreshing ? (
              <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">Updating…</span>
            ) : null}
          </label>
          <CatalogTextBtn
            onClick={() => setSvcModal({ mode: 'create' })}
            tone="primary"
            disabled={!activeCategories.length}
          >
            Add service
          </CatalogTextBtn>
        </div>
      </header>

      {err ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-zinc-500">Loading services…</p> : null}

      <section aria-labelledby="svc-active" className="space-y-3" aria-busy={refreshing}>
        <h2 id="svc-active" className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Active services
        </h2>
        {activeServices.length ? (
          <>
            <div className="grid gap-3 md:hidden">
              {activeServices.map((row) => (
                <article
                  key={row.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {catById.get(row.categoryId) ?? '—'}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">{row.name}</h3>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">{row.price}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CatalogTextBtn onClick={() => setSvcModal({ mode: 'edit', id: row.id, row })}>Edit</CatalogTextBtn>
                    <CatalogTextBtn tone="danger" onClick={() => void deleteService(row.id)}>
                      Delete
                    </CatalogTextBtn>
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
                      <th className="px-4 py-3 lg:px-5">Price</th>
                      <th className="px-4 py-3 lg:px-5">Category</th>
                      <th className="px-4 py-3 text-right lg:px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {activeServices.map((row) => (
                      <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white lg:px-5">{row.name}</td>
                        <td className="px-4 py-3 tabular-nums lg:px-5">{row.price}</td>
                        <td className="px-4 py-3 lg:px-5">{catById.get(row.categoryId) ?? '—'}</td>
                        <td className="px-4 py-3 text-right lg:px-5">
                          <div className="inline-flex flex-wrap justify-end gap-2">
                            <CatalogTextBtn onClick={() => setSvcModal({ mode: 'edit', id: row.id, row })}>Edit</CatalogTextBtn>
                            <CatalogTextBtn tone="danger" onClick={() => void deleteService(row.id)}>
                              Delete
                            </CatalogTextBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500">No active services yet.</p>
        )}
      </section>

      {archivedServices.length ? (
        <section
          aria-labelledby="svc-archived"
          className="space-y-3 rounded-xl border border-dashed border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
        >
          <h2
            id="svc-archived"
            className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200"
          >
            Archived services
          </h2>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/80">Soft-deleted. Only restore is available here.</p>
          <div className="grid gap-3 md:hidden">
            {archivedServices.map((row) => (
              <article
                key={row.id}
                className="rounded-xl border border-amber-200/90 bg-white/90 p-4 shadow-sm dark:border-amber-900/50 dark:bg-zinc-900/80"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Archived
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {catById.get(row.categoryId) ?? '—'}
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-800 line-through dark:text-zinc-200">{row.name}</h3>
                <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">{row.price}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CatalogTextBtn onClick={() => void restoreService(row.id)} tone="primary">
                    Restore
                  </CatalogTextBtn>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-amber-200/90 bg-white/90 shadow-sm dark:border-amber-900/50 dark:bg-zinc-900/80 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200/80 bg-amber-100/50 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    <th className="px-4 py-3 lg:px-5">Name</th>
                    <th className="px-4 py-3 lg:px-5">Price</th>
                    <th className="px-4 py-3 lg:px-5">Category</th>
                    <th className="px-4 py-3 text-right lg:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 dark:divide-amber-900/30">
                  {archivedServices.map((row) => (
                    <tr key={row.id} className="text-zinc-700 dark:text-zinc-300">
                      <td className="px-4 py-3 font-medium text-zinc-800 line-through dark:text-zinc-200 lg:px-5">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400 lg:px-5">{row.price}</td>
                      <td className="px-4 py-3 lg:px-5">{catById.get(row.categoryId) ?? '—'}</td>
                      <td className="px-4 py-3 text-right lg:px-5">
                        <CatalogTextBtn onClick={() => void restoreService(row.id)} tone="primary">
                          Restore
                        </CatalogTextBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      <ListPagination
        page={page}
        limit={limit}
        total={meta.total}
        onPageChange={setPage}
        onLimitChange={setLimitAndReset}
        disabled={loading || refreshing}
      />

      {svcModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {svcModal.mode === 'edit' ? 'Edit service' : 'New service'}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={serviceForm.handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="svc-name">
                  Name
                </label>
                <input id="svc-name" name="name" className={input} value={serviceForm.values.name} onChange={serviceForm.handleChange} />
                {serviceForm.errors.name ? <p className="mt-1 text-xs text-red-600">{serviceForm.errors.name}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="svc-desc">
                  Description
                </label>
                <textarea
                  id="svc-desc"
                  name="description"
                  rows={2}
                  className={input}
                  value={serviceForm.values.description}
                  onChange={serviceForm.handleChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="svc-price">
                  Price
                </label>
                <input
                  id="svc-price"
                  name="price"
                  type="number"
                  step="0.01"
                  className={input}
                  value={serviceForm.values.price}
                  onChange={serviceForm.handleChange}
                />
                {serviceForm.errors.price ? <p className="mt-1 text-xs text-red-600">{serviceForm.errors.price}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="svc-cat">
                  Category
                </label>
                <select
                  id="svc-cat"
                  name="categoryId"
                  className={input}
                  value={serviceForm.values.categoryId}
                  onChange={serviceForm.handleChange}
                >
                  {selectableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {serviceForm.errors.categoryId ? (
                  <p className="mt-1 text-xs text-red-600">{serviceForm.errors.categoryId}</p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={serviceForm.values.isActive}
                  onChange={(e) => serviceForm.setFieldValue('isActive', e.target.checked)}
                />
                Active
              </label>
              {serviceForm.status?.api?.length ? (
                <p className="text-xs text-red-600">{serviceForm.status.api.join(' · ')}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <CatalogTextBtn type="button" onClick={() => setSvcModal(null)}>
                  Cancel
                </CatalogTextBtn>
                <CatalogTextBtn type="submit" tone="primary" disabled={serviceForm.isSubmitting}>
                  Save
                </CatalogTextBtn>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

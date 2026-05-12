import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { api } from '@/services/api.js'
import { getApiErrorMessages } from '@/utils/getApiErrorMessages.js'
import { ListPagination } from '@/components/ui/ListPagination.jsx'
import { CatalogTextBtn } from '@/features/catalog/CatalogTextBtn.jsx'
import { catalogFetchJson, isArchivedCatalogRow } from '@/features/catalog/catalogHelpers.js'

const DEFAULT_META = { page: 1, limit: 20, total: 0 }

export function CategoriesManage() {
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(DEFAULT_META)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [err, setErr] = useState(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [catModal, setCatModal] = useState(null)
  const hasLoadedOnceRef = useRef(false)

  const load = useCallback(async () => {
    const silent = hasLoadedOnceRef.current
    if (!silent) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setErr(null)
    const listParams = { limit, page, includeDeleted: showDeleted }
    try {
      const cRes = await catalogFetchJson('/admin/catalog/categories', { params: listParams })
      const list = Array.isArray(cRes?.data) ? cRes.data : []
      setCategories(list)
      const m = cRes?.meta
      if (m && typeof m === 'object') {
        setMeta({
          page: Number(m.page) || page,
          limit: Number(m.limit) || limit,
          total: Number(m.total) || 0,
        })
      } else {
        setMeta({ page, limit, total: list.length })
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

  const activeCategories = useMemo(
    () => categories.filter((c) => !isArchivedCatalogRow(c)),
    [categories],
  )
  const archivedCategories = useMemo(
    () => categories.filter((c) => isArchivedCatalogRow(c)),
    [categories],
  )

  const categoryForm = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({ name: Yup.string().trim().min(1).max(128).required() }),
    onSubmit: async (values, { resetForm, setStatus }) => {
      setStatus(undefined)
      try {
        if (catModal?.mode === 'edit') {
          await api.put(`/admin/catalog/categories/${catModal.id}`, {
            name: values.name,
            isActive: true,
          })
        } else {
          await api.post('/admin/catalog/categories', { name: values.name })
        }
        resetForm()
        setCatModal(null)
        await load()
      } catch (e) {
        setStatus({ api: getApiErrorMessages(e) })
      }
    },
    enableReinitialize: true,
  })

  useEffect(() => {
    if (catModal?.mode === 'edit') {
      categoryForm.setValues({ name: catModal.name ?? '' })
    } else if (catModal?.mode === 'create') {
      categoryForm.setValues({ name: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catModal])

  const deleteCategory = async (id) => {
    if (!window.confirm('Soft-delete this category?')) return
    try {
      await api.delete(`/admin/catalog/categories/${id}`)
      await load()
    } catch (e) {
      setErr(getApiErrorMessages(e).join(' · '))
    }
  }

  const restoreCategory = async (id) => {
    try {
      await api.patch(`/admin/catalog/categories/${id}/restore`)
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
            Categories
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
          <CatalogTextBtn onClick={() => setCatModal({ mode: 'create' })} tone="primary">
            Add category
          </CatalogTextBtn>
        </div>
      </header>

      {err ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-zinc-500">Loading categories…</p> : null}

      <section aria-labelledby="cat-active" className="space-y-2" aria-busy={refreshing}>
        <h2 id="cat-active" className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Active categories
        </h2>
        {activeCategories.length ? (
          <ul className="flex flex-wrap gap-2">
            {activeCategories.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-medium text-zinc-900 dark:text-white">{c.name}</span>
                <CatalogTextBtn onClick={() => setCatModal({ mode: 'edit', id: c.id, name: c.name })}>Edit</CatalogTextBtn>
                <CatalogTextBtn onClick={() => void deleteCategory(c.id)} tone="danger">
                  Delete
                </CatalogTextBtn>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No active categories yet.</p>
        )}
      </section>

      {archivedCategories.length ? (
        <section
          aria-labelledby="cat-archived"
          className="space-y-2 rounded-xl border border-dashed border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
        >
          <h2
            id="cat-archived"
            className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200"
          >
            Archived categories
          </h2>
          <p className="text-xs text-amber-800/90 dark:text-amber-200/80">Soft-deleted. Restore to use them again for services.</p>
          <ul className="flex flex-wrap gap-2">
            {archivedCategories.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-white/90 px-3 py-2 text-sm dark:border-amber-900/60 dark:bg-zinc-900/80"
              >
                <span className="font-medium text-zinc-800 line-through dark:text-zinc-200">{c.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Archived
                </span>
                <CatalogTextBtn onClick={() => void restoreCategory(c.id)} tone="primary">
                  Restore
                </CatalogTextBtn>
              </li>
            ))}
          </ul>
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

      {catModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {catModal.mode === 'edit' ? 'Edit category' : 'New category'}
            </h3>
            <form className="mt-4 space-y-3" onSubmit={categoryForm.handleSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-zinc-500" htmlFor="cat-name">
                  Name
                </label>
                <input
                  id="cat-name"
                  name="name"
                  className={input}
                  value={categoryForm.values.name}
                  onChange={categoryForm.handleChange}
                />
                {categoryForm.errors.name ? (
                  <p className="mt-1 text-xs text-red-600">{categoryForm.errors.name}</p>
                ) : null}
              </div>
              {categoryForm.status?.api?.length ? (
                <p className="text-xs text-red-600">{categoryForm.status.api.join(' · ')}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <CatalogTextBtn type="button" onClick={() => setCatModal(null)}>
                  Cancel
                </CatalogTextBtn>
                <CatalogTextBtn type="submit" tone="primary" disabled={categoryForm.isSubmitting}>
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

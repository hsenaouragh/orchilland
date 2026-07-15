import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { useAdminAuth } from './AdminAuthContext'

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for admin data. Loads every table from Supabase and
// exposes typed helpers + mutations. Column names match database/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

const AdminDataContext = createContext(null)

const EMPTY = {
  users: [], languages: [], courses: [], course_applications: [], payment_receipts: [],
  enrollments: [], lessons: [], lesson_access: [], assignments: [], assignment_releases: [],
  assignment_submissions: [], course_tests: [], course_test_questions: [], course_test_options: [],
  course_test_releases: [], course_test_attempts: [], course_test_answers: [], books: [],
  book_orders: [], book_payment_receipts: [], posts: [], post_likes: [], post_comments: [],
  course_reviews: [], notifications: [], offers: [],
}

const nowISO = () => new Date().toISOString()

export const AdminDataProvider = ({ children }) => {
  const { user } = useAdminAuth()
  const adminId = user?.id || null

  const [tables, setTables] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.loadAll()
      setTables({ ...EMPTY, ...data })
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const applyLocal = useCallback((table, updater) => {
    setTables((prev) => ({ ...prev, [table]: updater(prev[table] || []) }))
  }, [])

  const createRow = useCallback(async (table, payload) => {
    const row = await api.create(table, payload)
    applyLocal(table, (rows) => [row, ...rows])
    return row
  }, [applyLocal])

  const updateRow = useCallback(async (table, id, patch) => {
    const row = await api.update(table, id, patch)
    applyLocal(table, (rows) => rows.map((r) => (r.id === id ? { ...r, ...(row || patch) } : r)))
    return row
  }, [applyLocal])

  const removeRow = useCallback(async (table, id) => {
    await api.remove(table, id)
    applyLocal(table, (rows) => rows.filter((r) => r.id !== id))
  }, [applyLocal])

  // ── Cross-table helpers ──────────────────────────────────────────────────
  const userById = useCallback((id) => tables.users.find((u) => u.id === id) || null, [tables.users])
  const courseById = useCallback((id) => tables.courses.find((c) => c.id === id) || null, [tables.courses])
  const bookById = useCallback((id) => tables.books.find((b) => b.id === id) || null, [tables.books])
  const languageById = useCallback((id) => tables.languages.find((l) => l.id === id) || null, [tables.languages])
  const receiptForApplication = useCallback(
    (appId) => tables.payment_receipts.find((r) => r.application_id === appId) || null,
    [tables.payment_receipts],
  )
  const receiptForBookOrder = useCallback(
    (orderId) => tables.book_payment_receipts.find((r) => r.book_order_id === orderId) || null,
    [tables.book_payment_receipts],
  )
  const enrollmentsForCourse = useCallback(
    (courseId) => tables.enrollments.filter((e) => e.course_id === courseId),
    [tables.enrollments],
  )
  const offerById = useCallback((id) => tables.offers.find((o) => o.id === id) || null, [tables.offers])
  // Offer claims are payment_receipts rows that carry an offer_id.
  const offerClaims = useMemo(
    () => tables.payment_receipts.filter((r) => r.offer_id),
    [tables.payment_receipts],
  )

  // ── Domain actions ────────────────────────────────────────────────────────

  // Approve an application: mark it + its receipt approved, then create the
  // enrollment (only after approval, per the schema notes).
  const approveApplication = useCallback(async (application, note) => {
    const receipt = receiptForApplication(application.id)
    await updateRow('course_applications', application.id, {
      status: 'approved',
      admin_note: note ?? application.admin_note ?? '',
      reviewed_at: nowISO(),
      reviewed_by: adminId,
    })
    if (receipt) {
      // payment_receipts: status + review audit fields (no admin_note column here;
      // user_note belongs to the student). The admin note lives on the application.
      await updateRow('payment_receipts', receipt.id, {
        status: 'approved', reviewed_at: nowISO(), reviewed_by: adminId,
      })
    }

    const already = tables.enrollments.some(
      (e) => e.student_id === application.student_id && e.course_id === application.course_id,
    )
    let enrollment = null
    if (!already) {
      enrollment = await createRow('enrollments', {
        student_id: application.student_id,
        course_id: application.course_id,
        application_id: application.id,
        status: 'active',
        progress_percent: 0,
        final_grade: null,
        enrolled_at: nowISO(),
      })
    }
    return enrollment
  }, [adminId, createRow, updateRow, receiptForApplication, tables.enrollments])

  const denyApplication = useCallback(async (application, note) => {
    const receipt = receiptForApplication(application.id)
    await updateRow('course_applications', application.id, {
      status: 'denied', admin_note: note ?? application.admin_note ?? '', reviewed_at: nowISO(), reviewed_by: adminId,
    })
    if (receipt) {
      await updateRow('payment_receipts', receipt.id, { status: 'denied', reviewed_at: nowISO(), reviewed_by: adminId })
    }
  }, [adminId, updateRow, receiptForApplication])

  const setApplicationNote = useCallback((id, note) =>
    updateRow('course_applications', id, { admin_note: note }), [updateRow])

  // Approve / deny an offer claim (a payment_receipts row with an offer_id).
  // On approval, enroll the student in every course bundled in the offer.
  const decideOfferClaim = useCallback(async (claim, status) => {
    await updateRow('payment_receipts', claim.id, {
      status: status === 'approved' ? 'approved' : 'denied',
      reviewed_at: nowISO(),
      reviewed_by: adminId,
    })
    if (status !== 'approved') return
    const offer = tables.offers.find((o) => o.id === claim.offer_id)
    const courseIds = offer?.course_ids || []
    for (const courseId of courseIds) {
      const already = tables.enrollments.some(
        (e) => e.student_id === claim.student_id && e.course_id === courseId,
      )
      if (!already) {
        await createRow('enrollments', {
          student_id: claim.student_id,
          course_id: courseId,
          status: 'active',
          progress_percent: 0,
          final_grade: null,
          enrolled_at: nowISO(),
        })
      }
    }
  }, [adminId, updateRow, createRow, tables.offers, tables.enrollments])

  // Approve / deny a book order + its receipt together.
  const decideBookOrder = useCallback(async (order, status, note) => {
    const receiptStatus = status === 'approved' ? 'approved' : 'denied'
    await updateRow('book_orders', order.id, { status })
    const receipt = receiptForBookOrder(order.id)
    if (receipt) {
      await updateRow('book_payment_receipts', receipt.id, {
        status: receiptStatus, admin_note: note ?? receipt.admin_note ?? '', reviewed_at: nowISO(),
      })
    }
  }, [updateRow, receiptForBookOrder])

  // Revoke a student's course access: suspend the enrollment (reversible; keeps
  // grades and submissions) and notify the student. The student app gates access
  // on enrollment.status === 'active', so a suspended enrollment locks them out.
  const revokeAccess = useCallback(async (enrollment) => {
    await updateRow('enrollments', enrollment.id, { status: 'suspended' })
    try {
      await createRow('notifications', {
        user_id: enrollment.student_id,
        title: 'Course access removed',
        message: 'An administrator removed your access to a course.',
        type: 'enrollment',
        related_type: 'enrollment',
        related_id: enrollment.id,
      })
    } catch { /* notification is best-effort */ }
  }, [updateRow, createRow])

  const restoreAccess = useCallback(async (enrollment) => {
    await updateRow('enrollments', enrollment.id, { status: 'active' })
    try {
      await createRow('notifications', {
        user_id: enrollment.student_id,
        title: 'Course access restored',
        message: 'An administrator restored your access to a course.',
        type: 'enrollment',
        related_type: 'enrollment',
        related_id: enrollment.id,
      })
    } catch { /* best-effort */ }
  }, [updateRow, createRow])

  const markNotificationRead = useCallback((id) =>
    updateRow('notifications', id, { read_at: nowISO() }), [updateRow])

  const markAllNotificationsRead = useCallback(async () => {
    const unread = tables.notifications.filter((n) => !n.read_at && (!adminId || n.user_id === adminId))
    await Promise.all(unread.map((n) => updateRow('notifications', n.id, { read_at: nowISO() })))
  }, [adminId, tables.notifications, updateRow])

  const value = useMemo(() => ({
    ...tables,
    loading,
    error,
    adminId,
    refresh,
    createRow,
    updateRow,
    removeRow,
    userById,
    courseById,
    bookById,
    languageById,
    receiptForApplication,
    receiptForBookOrder,
    enrollmentsForCourse,
    offerById,
    offerClaims,
    approveApplication,
    denyApplication,
    setApplicationNote,
    decideBookOrder,
    decideOfferClaim,
    revokeAccess,
    restoreAccess,
    markNotificationRead,
    markAllNotificationsRead,
  }), [
    tables, loading, error, adminId, refresh, createRow, updateRow, removeRow,
    userById, courseById, bookById, languageById, receiptForApplication, receiptForBookOrder,
    enrollmentsForCourse, offerById, offerClaims, approveApplication, denyApplication, setApplicationNote,
    decideBookOrder, decideOfferClaim, revokeAccess, restoreAccess, markNotificationRead, markAllNotificationsRead,
  ])

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used inside <AdminDataProvider>')
  return ctx
}

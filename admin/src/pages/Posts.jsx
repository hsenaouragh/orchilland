import { useState } from 'react'
import { Plus, Pencil, TrashBin, ToggleOn, ToggleOff, Heart, HeartFill, Comment, PaperPlane } from '@gravity-ui/icons'
import { useAdminData } from '../hooks/AdminDataContext'
import { useAdminAuth } from '../hooks/AdminAuthContext'
import StatusBadge from '../components/StatusBadge'
import AdminModal from '../components/AdminModal'
import MultiImageUpload from '../components/MultiImageUpload'
import { PageHeader, Button, IconButton, Field, Input, Textarea, EmptyNote } from '../components/ui'
import { formatDate, timeAgo } from '../lib/format'

// A post may carry many images. `images` is the array; `image_url` mirrors the
// first one as the cover for older readers / list thumbnails.
const imagesOf = (post) => (Array.isArray(post?.images) && post.images.length
  ? post.images
  : (post?.image_url ? [post.image_url] : []))

const PostForm = ({ initial, onCancel, onSubmit, saving }) => {
  const [form, setForm] = useState({
    title: initial?.title || '', content: initial?.content || '',
    images: imagesOf(initial), is_published: initial?.is_published ?? true,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      title: form.title,
      content: form.content,
      is_published: form.is_published,
      images: form.images,
      image_url: form.images[0] || null, // cover
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><Input value={form.title} onChange={set('title')} placeholder="Post title" required /></Field>
      <MultiImageUpload
        label="Images"
        folder="posts"
        bucket="POSTS"
        value={form.images}
        onChange={(images) => setForm((f) => ({ ...f, images }))}
        hint="Add one or more images (first is the cover). Saved to the POSTS bucket."
      />
      <Field label="Content"><Textarea value={form.content} onChange={set('content')} placeholder="Write the post…" className="min-h-40" /></Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-body)]">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
        Publish immediately
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save post' : 'Create post'}</Button>
      </div>
    </form>
  )
}

const Posts = () => {
  const data = useAdminData()
  const { user } = useAdminAuth()
  const [editing, setEditing] = useState(null)
  const [engage, setEngage] = useState(null)   // post whose likes/comments we view
  const [confirm, setConfirm] = useState(null)
  const [reply, setReply] = useState({})        // parentCommentId -> text
  const [saving, setSaving] = useState(false)

  // Admin-authored comments/replies always show as "Orchilla Admin".
  const nameFor = (userId) => {
    const u = data.userById(userId)
    if (u?.role === 'admin' || userId === user?.id) return 'Orchilla Admin'
    return u?.name || 'Student'
  }

  const save = async (payload) => {
    setSaving(true)
    try {
      if (editing === 'new') {
        await data.createRow('posts', { ...payload, author_id: user.id })
      } else {
        await data.updateRow('posts', editing.id, payload)
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  const togglePublish = (p) => data.updateRow('posts', p.id, { is_published: !p.is_published })

  const remove = async () => {
    setSaving(true)
    try { await data.removeRow('posts', confirm.id); setConfirm(null) } finally { setSaving(false) }
  }

  // Admin like/unlike a post (post_likes row keyed by the admin's user id).
  const myLike = (postId) => data.post_likes.find((l) => l.post_id === postId && l.user_id === user?.id)
  const toggleLike = async (postId) => {
    const existing = myLike(postId)
    if (existing) await data.removeRow('post_likes', existing.id)
    else await data.createRow('post_likes', { post_id: postId, user_id: user.id })
  }

  const sendReply = async (parent) => {
    const text = (reply[parent.id] || '').trim()
    if (!text) return
    setSaving(true)
    try {
      await data.createRow('post_comments', {
        post_id: parent.post_id, user_id: user.id, content: text, parent_comment_id: parent.id,
      })
      setReply((r) => ({ ...r, [parent.id]: '' }))
    } finally { setSaving(false) }
  }

  // Remove a comment (and its replies) — admin moderation.
  const deleteComment = async (comment) => {
    const replies = data.post_comments.filter((r) => r.parent_comment_id === comment.id)
    for (const r of replies) await data.removeRow('post_comments', r.id)
    await data.removeRow('post_comments', comment.id)
  }

  const posts = [...data.posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const likesFor = (id) => data.post_likes.filter((l) => l.post_id === id).length
  const commentsFor = (id) => data.post_comments.filter((c) => c.post_id === id)

  return (
    <div>
      <PageHeader
        title="Posts"
        subtitle="Publish articles and manage community engagement."
        actions={<Button icon={Plus} onClick={() => setEditing('new')}>New post</Button>}
      />

      {posts.length === 0 ? (
        <EmptyNote>No posts yet.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {posts.map((p) => {
            const comments = commentsFor(p.id)
            const liked = !!myLike(p.id)
            const images = imagesOf(p)
            return (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {images.length > 0 && (
                  <div className="relative">
                    <img src={images[0]} alt="" className="h-40 w-full object-cover" />
                    {images.length > 1 && (
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                        +{images.length - 1} more
                      </span>
                    )}
                    {images.length > 1 && (
                      <div className="flex gap-1 bg-[var(--color-panel)] p-1.5">
                        {images.slice(0, 6).map((src, i) => (
                          <img key={src + i} src={src} alt="" className="h-10 w-10 rounded object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-bold text-[var(--color-text)]">{p.title}</h3>
                    <StatusBadge status={p.is_published ? 'published' : 'unpublished'} />
                  </div>
                  <p className="mb-4 line-clamp-3 flex-1 text-sm text-[var(--color-text-muted)]">{p.content}</p>
                  <div className="mb-4 flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                    <button
                      onClick={() => toggleLike(p.id)}
                      title={liked ? 'Unlike' : 'Like'}
                      className={`inline-flex items-center gap-1.5 transition ${liked ? 'text-[var(--color-primary)]' : 'hover:text-[var(--color-primary)]'}`}
                    >
                      {liked ? <HeartFill style={{ width: 15, height: 15 }} /> : <Heart style={{ width: 15, height: 15 }} />}
                      {likesFor(p.id)}
                    </button>
                    <span className="inline-flex items-center gap-1.5"><Comment style={{ width: 15, height: 15 }} /> {comments.length}</span>
                    <span className="ml-auto text-xs text-[var(--color-text-faint)]">{formatDate(p.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-[var(--color-border)] pt-3">
                    <Button size="sm" variant="outline" icon={Comment} onClick={() => setEngage(p)}>Engagement</Button>
                    <div className="ml-auto flex gap-1.5">
                      <IconButton icon={p.is_published ? ToggleOn : ToggleOff} tone={p.is_published ? 'green' : 'muted'} label="Publish" onClick={() => togglePublish(p)} />
                      <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(p)} />
                      <IconButton icon={TrashBin} tone="danger" label="Delete" onClick={() => setConfirm(p)} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / edit */}
      <AdminModal open={!!editing} onClose={() => setEditing(null)} size="lg" title={editing === 'new' ? 'New post' : 'Edit post'}>
        <PostForm initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSubmit={save} saving={saving} />
      </AdminModal>

      {/* Engagement: like + threaded comments with reply / delete */}
      <AdminModal open={!!engage} onClose={() => setEngage(null)} size="lg" title="Engagement" subtitle={engage?.title}>
        {engage && (() => {
          const all = commentsFor(engage.id)
          const roots = all.filter((c) => !c.parent_comment_id)
          const liked = !!myLike(engage.id)
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                <button
                  onClick={() => toggleLike(engage.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold transition ${
                    liked ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {liked ? <HeartFill style={{ width: 14, height: 14 }} /> : <Heart style={{ width: 14, height: 14 }} />}
                  {liked ? 'Liked' : 'Like'} · {likesFor(engage.id)}
                </button>
                <span>{all.length} comments</span>
              </div>

              {roots.length === 0 ? <EmptyNote>No comments yet.</EmptyNote> : roots.map((c) => (
                <div key={c.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{nameFor(c.user_id)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-text-faint)]">{timeAgo(c.created_at)}</span>
                      <button
                        onClick={() => deleteComment(c)}
                        title="Delete comment"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger-faint)] hover:text-[var(--color-danger)]"
                      >
                        <TrashBin style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-body)]">{c.content}</p>

                  {/* Replies */}
                  {all.filter((r) => r.parent_comment_id === c.id).map((r) => (
                    <div key={r.id} className="mt-2 ml-4 flex items-start justify-between gap-2 rounded-lg border-l-2 border-[var(--color-accent)] bg-[var(--color-surface)] px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-accent)]">{nameFor(r.user_id)}</p>
                        <p className="text-sm text-[var(--color-text-body)]">{r.content}</p>
                      </div>
                      <button
                        onClick={() => data.removeRow('post_comments', r.id)}
                        title="Delete reply"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--color-text-faint)] transition hover:text-[var(--color-danger)]"
                      >
                        <TrashBin style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  ))}

                  {/* Reply box */}
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      value={reply[c.id] || ''}
                      onChange={(e) => setReply((r) => ({ ...r, [c.id]: e.target.value }))}
                      placeholder="Reply as admin…"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && sendReply(c)}
                    />
                    <IconButton icon={PaperPlane} label="Send reply" onClick={() => sendReply(c)} />
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </AdminModal>

      {/* Delete */}
      <AdminModal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title="Delete post?" subtitle={confirm?.title}
        footer={<>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</Button>
        </>}>
        <p className="text-sm text-[var(--color-text-muted)]">Comments and likes are removed with the post.</p>
      </AdminModal>
    </div>
  )
}

export default Posts

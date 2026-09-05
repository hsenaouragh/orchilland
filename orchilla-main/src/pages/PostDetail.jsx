import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, HeartFill, Comment, PaperPlane, Bookmark } from '@gravity-ui/icons'
import { useAuth } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import {
  fetchPosts,
  fetchPostLikes,
  fetchPostComments,
  togglePostLike,
  addComment,
} from '../services/db'
import PostGallery from '../components/ui/postGallery'

const Avatar = ({ name, size = 32 }) => (
  <div
    style={{ width: size, height: size }}
    className='shrink-0 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold'
  >
    {(name || '?').slice(0, 2).toUpperCase()}
  </div>
)

const PostDetail = () => {
  const { postId } = useParams()
  const { user, openAuth } = useAuth()
  const { data, loading, setData } = useQuery(async () => {
    const [posts, postLikes, postComments] = await Promise.all([
      fetchPosts(), fetchPostLikes(), fetchPostComments(user),
    ])
    return { posts, postLikes, postComments }
  }, [user?.id], { posts: [], postLikes: [], postComments: [] })
  const { posts, postLikes, postComments } = data

  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const post = posts.find(item => item.id === postId)

  if (loading) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <p className='text-sm font-semibold text-[var(--color-text)]'>Loading post...</p>
      </main>
    )
  }

  if (!post) {
    return (
      <main className='max-w-3xl mx-auto px-4 py-20 text-center'>
        <h1 className='text-2xl font-bold text-[var(--color-text)]'>Post not found</h1>
        <Link to='/posts' className='inline-flex mt-6 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white'>Back to posts</Link>
      </main>
    )
  }

  const liked = postLikes.some(l => l.postId === post.id && l.userId === user?.id)
  const likesCount = postLikes.filter(l => l.postId === post.id).length
  const comments = postComments.filter(c => c.postId === post.id)
  const hasImages = post.images.length > 0

  const likePost = async () => {
    if (!user) { openAuth(); return }
    setError('')
    try {
      const existingLike = postLikes.find(l => l.postId === post.id && l.userId === user.id)
      const result = await togglePostLike({ postId: post.id, user, existingLike })
      setData(prev => ({
        ...prev,
        postLikes: result.removed
          ? prev.postLikes.filter(l => l.id !== existingLike.id)
          : [...prev.postLikes, result.like],
      }))
    } catch (err) {
      setError(err.message || 'Could not update like')
    }
  }

  const submitComment = async () => {
    if (!user) { openAuth(); return }
    if (!comment.trim()) return
    setError('')
    try {
      const created = await addComment({ postId: post.id, content: comment, user })
      if (created) setData(prev => ({ ...prev, postComments: [...prev.postComments, created] }))
      setComment('')
    } catch (err) {
      setError(err.message || 'Could not post comment')
    }
  }

  return (
    <main className='max-w-5xl mx-auto px-4 py-8'>
      <div className='rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white dark:bg-slate-900 flex flex-col md:flex-row'>
        {/* ── Left: image ── */}
        {hasImages && (
          <div className='md:w-[55%]  flex items-center justify-center'>
            <PostGallery images={post.images} alt={post.title} />
          </div>
        )}

        {/* ── Right: interactions ── */}
        <div className={`flex flex-col ${hasImages ? 'md:w-[45%]' : 'w-full'}`} style={{ maxHeight: 620 }}>
          {/* header */}
          <div className='flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]'>
            <Avatar name={post.authorName} />
            <p className='flex-1 font-semibold text-sm text-[var(--color-text)]'>{post.authorName}</p>
          </div>

          {/* caption + comments (scrolls) */}
          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[180px]'>
            <div className='flex gap-3'>
              <Avatar name={post.authorName} />
              <p className='text-sm text-[var(--color-text)] leading-relaxed'>
                <span className='font-semibold'>{post.authorName}</span>{' '}
                <span className='font-semibold'>{post.title}</span>{' '}
                <span className='text-[var(--color-text-muted)]'>{post.content}</span>
              </p>
            </div>

            {comments.length === 0 ? (
              <p className='text-sm text-[var(--color-text-muted)]'>No comments yet. Be the first to comment.</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className='flex gap-3'>
                  <Avatar name={c.userName} />
                  <p className='text-sm text-[var(--color-text)] leading-relaxed'>
                    <span className='font-semibold'>{c.userName}</span>{' '}
                    <span className='text-[var(--color-text-muted)]'>{c.content}</span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* actions */}
          <div className='px-4 pt-3 border-t border-[var(--color-border)]'>
            <div className='flex items-center gap-4'>
              <button onClick={likePost} aria-label='Like' className='cursor-pointer'>
                {liked
                  ? <HeartFill style={{ width: 24, height: 24, color: '#ED4956' }} />
                  : <Heart style={{ width: 24, height: 24, color: 'var(--color-text)' }} />}
              </button>
              <Comment style={{ width: 24, height: 24, color: 'var(--color-text)' }} />
            </div>
            <p className='text-sm font-semibold text-[var(--color-text)] mt-2'>{likesCount} like{likesCount !== 1 ? 's' : ''}</p>
          </div>

          {error && <p className='px-4 pt-2 text-sm text-[var(--color-danger)]'>{error}</p>}

          {/* add comment */}
          <div className='flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border)]'>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitComment() }}
              placeholder='Add a comment…'
              className='flex-1 bg-transparent text-sm outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]'
            />
            <button
              onClick={submitComment}
              disabled={!comment.trim()}
              className='text-sm font-semibold text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className='mt-6'>
        <Link to='/posts' className='text-sm font-semibold text-[var(--color-primary)]'>← Back to posts</Link>
      </div>
    </main>
  )
}

export default PostDetail

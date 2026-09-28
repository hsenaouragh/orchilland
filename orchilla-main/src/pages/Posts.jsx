import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  HeartFill,
  Comment,
  Pencil,
  ArrowRight,
  Ellipsis,
  Camera,
  Xmark,
} from '@gravity-ui/icons'
import Button from '../components/ui/button'
import { useAuth, useProtectedAction } from '../hooks/AuthContext'
import { useQuery } from '../hooks/useQuery'
import {
  fetchPosts,
  fetchPostLikes,
  fetchPostComments,
  togglePostLike,
} from '../services/db'
import PostGallery from '../components/ui/postGallery'
import ParisLandmark from '../assets/paris_landmark.jpg'
import CtaGlobeBooks from '../assets/cta_globe_books.jpg'

const FALLBACK_POSTS = [
  {
    id: 'post-1',
    authorName: 'Sara Lopez',
    courseTag: 'French A1',
    timeAgo: '2 hours ago',
    title: 'Finally visited Paris! 🇫🇷',
    content:
      'The city is even more beautiful than I imagined. I practiced my French a lot, and it really helped me connect with the locals. Highly recommend applying what you learn in real life!',
    images: [ParisLandmark],
    tags: ['#travel', '#french'],
    likesCount: 24,
    commentsCount: 6,
    isPublished: true,
  },
  {
    id: 'post-2',
    authorName: 'Ahmed Benali',
    courseTag: 'French A1',
    timeAgo: '5 hours ago',
    title: 'New French learning routine',
    content:
      'I’ve been using the platform for 3 weeks now and I can already notice improvement. The lessons are well structured and the exercises are really helpful. Looking forward to the next level! 📈',
    images: [],
    tags: ['#routine', '#progress'],
    likesCount: 18,
    commentsCount: 4,
    isPublished: true,
  },
  {
    id: 'post-3',
    authorName: 'Emma Wilson',
    courseTag: 'French A1',
    timeAgo: '1 day ago',
    title: 'Grammar tip 💡',
    content:
      'Just a quick tip for beginners: in French, the verb "être" is super important! It’s used in many situations and can be tricky at first. Keep practicing and it will become natural. 💕',
    images: [],
    tags: ['#grammar'],
    likesCount: 32,
    commentsCount: 8,
    isPublished: true,
  },
  {
    id: 'post-4',
    authorName: 'Luca Rossi',
    courseTag: 'French A1',
    timeAgo: '2 days ago',
    title: 'My first week',
    content:
      'I just started the French A1 course and I’m really excited! The lessons are short and easy to follow. The platform is super user-friendly and the teachers are amazing. 😊',
    images: [],
    tags: ['#beginner', '#community'],
    likesCount: 15,
    commentsCount: 3,
    isPublished: true,
  },
  {
    id: 'post-5',
    authorName: 'Sophie Martin',
    courseTag: 'French A1',
    timeAgo: '3 days ago',
    title: 'Study motivation ✨',
    content:
      'Progress may be slow, but it’s still progress! 💪 Keep going everyone, we can do it!',
    images: [CtaGlobeBooks],
    tags: ['#motivation'],
    likesCount: 41,
    commentsCount: 7,
    isPublished: true,
  },
  {
    id: 'post-6',
    authorName: 'Carlos Mendez',
    courseTag: 'French A1',
    timeAgo: '4 days ago',
    title: 'Language exchange?',
    content:
      'Hi everyone! I’m looking for a language partner to practice French. I can help with Spanish or English in return. Let me know if you’re interested! 🤝',
    images: [],
    tags: ['#language-exchange', '#french'],
    likesCount: 12,
    commentsCount: 5,
    isPublished: true,
  },
]

const Posts = () => {
  const { user, openAuth } = useAuth()
  const protect = useProtectedAction()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, reload } = useQuery(async () => {
    const [posts, postLikes, postComments] = await Promise.all([
      fetchPosts(),
      fetchPostLikes(),
      fetchPostComments(),
    ])
    return { posts, postLikes, postComments }
  }, [], { posts: [], postLikes: [], postComments: [] })

  const { posts: dbPosts, postLikes, postComments } = data

  // Merge live database posts with realistic defaults if DB has fewer posts
  const postsList = useMemo(() => {
    const publishedDb = dbPosts.filter(p => p.isPublished)
    if (publishedDb.length > 0) {
      return publishedDb.map((p, idx) => {
        const likes = postLikes.filter(l => l.postId === p.id).length
        const comments = postComments.filter(c => c.postId === p.id).length
        const fallback = FALLBACK_POSTS[idx % FALLBACK_POSTS.length]
        return {
          id: p.id,
          authorName: p.authorName || 'Student',
          authorAvatar: p.authorId === user?.id ? user?.avatarUrl : null,
          courseTag: p.courseTag || fallback.courseTag,
          timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : fallback.timeAgo,
          title: p.title,
          content: p.content,
          images: p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
          tags: fallback.tags,
          likesCount: likes,
          commentsCount: comments,
        }
      })
    }
    return FALLBACK_POSTS
  }, [dbPosts, postLikes, postComments, user?.id, user?.avatarUrl])

  const handleLike = async (e, post) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openAuth()
      return
    }
    try {
      await togglePostLike(post.id, user)
      reload()
    } catch {
      // ignore
    }
  }

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10'>
      {/* ── 1. HERO BANNER ────────────────────────────────────────── */}
      <section className='relative rounded-[32px] overflow-hidden border border-[var(--color-border)] shadow-sm bg-gradient-to-r from-[#FFF0EE] via-[#FFF8F5] to-[#FBE8E8] dark:from-[#3D2020] dark:via-[#341A1A] dark:to-[#2A1515] p-6 sm:p-10 lg:p-12 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
          {/* Left Hero Text */}
          <div className='lg:col-span-7 space-y-4 text-left'>
            <span className='inline-block text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
              Community
            </span>

            <h1 className='font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--color-text)] tracking-tight leading-tight'>
              Posts and updates
            </h1>

            <p className='text-xs sm:text-sm text-[var(--color-text-body)] leading-relaxed max-w-lg'>
              Read posts, like updates, and comment. Admin replies appear in the same thread.
            </p>
          </div>

          {/* Right Hero Visual: Social Card Mockup */}
          <div className='lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center'>
            {/* Handwritten note */}
            <div className='font-handwritten text-xl sm:text-2xl text-[var(--color-accent)] mb-2 rotate-[-4deg] select-none text-center lg:text-right w-full pr-4'>
              Share <br />
              Learn <br />
              Grow ♡
            </div>

            <div className='relative w-full max-w-xs rounded-2xl bg-white dark:bg-[#3D2020] p-4 shadow-xl border border-[var(--color-border)] space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center'>
                  OL
                </div>
                <div className='h-2.5 bg-[var(--color-panel)] rounded w-20' />
              </div>
              <div className='h-24 rounded-xl overflow-hidden shadow-inner'>
                <img src={ParisLandmark} alt='Community preview' className='w-full h-full object-cover' />
              </div>
              <div className='flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-semibold pt-1 border-t border-[var(--color-border)]/50'>
                <span className='flex items-center gap-1 text-[var(--color-accent)]'>♡ 24</span>
                <span className='flex items-center gap-1'>💬 6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CREATE POST TRIGGER BAR ────────────────────────────── */}
      <section className='flex items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] shadow-sm'>
        <div className='flex items-center gap-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-medium pl-2'>
          <div className='w-8 h-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0'>
            <Pencil style={{ width: 14, height: 14 }} />
          </div>
          <span>Share something with the community</span>
        </div>

        <Button
          size='sm'
          onClick={protect(() => setShowCreateModal(true))}
        >
          <span>Create Post</span>
          <ArrowRight style={{ width: 13, height: 13 }} />
        </Button>
      </section>

      {/* ── 3. POSTS 3-COLUMN GRID ─────────────────────────────────── */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
        {postsList.map(post => {
          const userLiked = postLikes.some(
            l => String(l.postId) === String(post.id) && l.userId === user?.id
          )

          return (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className='group flex flex-col justify-between bg-white dark:bg-[#3D2020] rounded-3xl border border-[var(--color-border)] p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:border-[var(--color-accent)]'
            >
              <div>
                {/* Author Header Row */}
                <div className='flex items-center justify-between gap-3 mb-3'>
                  <div className='flex items-center gap-2.5 min-w-0'>
                    {/* User Avatar: Real avatar or initial monogram (NO stock photos) */}
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className='w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-[#3D2020] shrink-0'
                      />
                    ) : (
                      <div className='w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm'>
                        {(post.authorName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className='min-w-0'>
                      <h3 className='text-xs sm:text-sm font-bold text-[var(--color-text)] leading-none truncate'>
                        {post.authorName}
                      </h3>
                      <p className='text-[10.5px] text-[var(--color-text-muted)] mt-0.5 truncate'>
                        {post.timeAgo} • {post.courseTag || 'Language Learner'}
                      </p>
                    </div>
                  </div>

                  {/* Options Dots */}
                  <button
                    type='button'
                    onClick={e => { e.preventDefault(); e.stopPropagation() }}
                    className='text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-full'
                  >
                    <Ellipsis style={{ width: 15, height: 15 }} />
                  </button>
                </div>

                {/* Title */}
                <h4 className='font-bold text-sm sm:text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-accent)] transition-colors leading-snug mb-1.5'>
                  {post.title}
                </h4>

                {/* Content */}
                <p className='text-xs text-[var(--color-text-body)] leading-relaxed line-clamp-3 mb-3'>
                  {post.content}
                </p>

                {/* Image Gallery Preview (if present) */}
                {post.images && post.images.length > 0 && (
                  <div className='mb-3 rounded-2xl overflow-hidden border border-black/5 bg-[var(--color-panel)] max-h-48'>
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className='w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1.5 mb-3'>
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] dark:text-[var(--color-accent)]'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Interaction Counters */}
              <div className='flex items-center gap-4 pt-3 border-t border-[var(--color-border)]/60 text-xs text-[var(--color-text-muted)] font-semibold'>
                <button
                  type='button'
                  onClick={e => handleLike(e, post)}
                  className='inline-flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors cursor-pointer'
                >
                  {userLiked ? (
                    <HeartFill style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
                  ) : (
                    <Heart style={{ width: 14, height: 14 }} />
                  )}
                  <span>{post.likesCount}</span>
                </button>

                <span className='inline-flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors'>
                  <Comment style={{ width: 14, height: 14 }} />
                  <span>{post.commentsCount}</span>
                </span>
              </div>
            </Link>
          )
        })}
      </section>

      {/* ── CREATE POST MODAL (CLEAN SIMPLE OVERLAY) ───────────────── */}
      {showCreateModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className='w-full max-w-lg rounded-3xl bg-white dark:bg-[#3D2020] border border-[var(--color-border)] p-6 sm:p-8 shadow-2xl space-y-4 animate-fade-up'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b border-[var(--color-border)] pb-3'>
              <h3 className='font-heading text-xl font-bold text-[var(--color-text)]'>
                Create Community Post
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className='w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-accent-faint)]'
              >
                <Xmark style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-bold text-[var(--color-text)] mb-1'>
                  Title
                </label>
                <input
                  type='text'
                  placeholder='Give your post a title...'
                  className='w-full px-4 py-2.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-[var(--color-text)] mb-1'>
                  Content
                </label>
                <textarea
                  rows={4}
                  placeholder='What are you learning today? Share your thoughts...'
                  className='w-full px-4 py-2.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none'
                />
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 pt-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={() => {
                  setShowCreateModal(false)
                }}
              >
                Publish Post →
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Posts

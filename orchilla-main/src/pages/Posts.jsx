import { Link } from 'react-router-dom'
import { Heart, Comment } from '@gravity-ui/icons'
import { useQuery } from '../hooks/useQuery'
import { fetchPosts, fetchPostLikes, fetchPostComments } from '../services/db'
import PostGallery from '../components/ui/postGallery'

const Posts = () => {
  const { data } = useQuery(async () => {
    const [posts, postLikes, postComments] = await Promise.all([
      fetchPosts(), fetchPostLikes(), fetchPostComments(),
    ])
    return { posts, postLikes, postComments }
  }, [], { posts: [], postLikes: [], postComments: [] })
  const { posts, postLikes, postComments } = data

  return (
    <main className='max-w-5xl mx-auto px-4 py-12'>
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>Community</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)] mt-2'>Posts and updates</h1>
        <p className='text-sm text-[var(--color-text-muted)] mt-2'>Read posts, like updates, and comment. Admin replies appear in the same thread.</p>
      </div>

      <div className='space-y-5'>
        {posts.filter(post => post.isPublished).map(post => (
          <Link key={post.id} to={`/posts/${post.id}`} className='block rounded-3xl border border-[var(--color-border)] bg-white dark:bg-slate-900 p-6 transition hover:-translate-y-1'>
            <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>{post.authorName}</p>
            <h2 className='text-xl font-bold text-[var(--color-text)] mt-2'>{post.title}</h2>
            {post.images.length > 0 && (
              <div className='mt-4'>
                <PostGallery images={post.images} alt={post.title} />
              </div>
            )}
            <p className='text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed'>{post.content}</p>
            <div className='flex items-center gap-4 text-sm text-[var(--color-text-muted)] mt-5'>
              <span className='inline-flex items-center gap-1'><Heart style={{ width: 15, height: 15 }} /> {postLikes.filter(like => like.postId === post.id).length}</span>
              <span className='inline-flex items-center gap-1'><Comment style={{ width: 15, height: 15 }} /> {postComments.filter(comment => comment.postId === post.id).length}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Posts

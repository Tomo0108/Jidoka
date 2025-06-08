import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</h1>
        <h2 className="text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          ページが見つかりません
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          お探しのページは存在しない、または移動された可能性があります。
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </Link>
          <Link
            href="/flow"
            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            フローチャートページ
          </Link>
        </div>
      </div>
    </div>
  )
} 
export default function DebugPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          Debug Page
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          このページが表示されていればNext.jsルーティングは正常に動作しています。
        </p>
        <div className="space-y-4">
          <p className="text-lg">✅ Next.js App Router</p>
          <p className="text-lg">✅ Tailwind CSS</p>
          <p className="text-lg">✅ TypeScript</p>
          <p className="text-lg">✅ Static Generation</p>
        </div>
        <div className="mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
} 
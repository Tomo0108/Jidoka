export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Jidoka</h1>
        <p className="text-lg text-gray-600 mb-8">
          セットアップが完了しました！アプリケーションが正常に動作しています。
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>成功!</strong> Next.jsアプリケーションが正常にデプロイされました。
        </div>
      </div>
    </main>
  );
} 
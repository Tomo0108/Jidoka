export default function SimplePage() {
  return (
    <html lang="ja">
      <head>
        <title>Simple Test Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: '40px', 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
            🎉 Vercel Deployment Success!
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
            このページが表示されていれば、基本的なNext.jsページが正常に動作しています。
          </p>
          <div style={{ marginBottom: '30px' }}>
            <p>✅ Next.js Server Side Rendering</p>
            <p>✅ Vercel Deployment</p>
            <p>✅ Static HTML Generation</p>
            <p>✅ Japanese Font Support</p>
          </div>
          <div>
            <a 
              href="/" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              メインページへ
            </a>
            <span style={{ margin: '0 10px' }}>|</span>
            <a 
              href="/flow" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              フローページへ
            </a>
          </div>
        </div>
      </body>
    </html>
  )
} 
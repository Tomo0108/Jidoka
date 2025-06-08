import sqlite3

def get_db_connection():
    """データベース接続を取得し、行を辞書としてアクセスできるように設定"""
    conn = sqlite3.connect('jidoka.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """データベースを初期化し、必要なテーブルを作成"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Projectsテーブルの作成
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 既存のテーブルにdescriptionカラムを追加（存在しない場合）
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN description TEXT")
    except sqlite3.OperationalError:
        # カラムが既に存在する場合は無視
        pass
    
    # Messagesテーブルの作成
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    # デフォルトプロジェクトが存在しない場合に作成
    cursor.execute("SELECT id FROM projects WHERE id = 1")
    if cursor.fetchone() is None:
        cursor.execute("INSERT INTO projects (id, name) VALUES (?, ?)", (1, "Default Project"))

    conn.commit()
    conn.close() 
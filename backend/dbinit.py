import sqlite3
def init_db(db_path='db/dev.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE
        )
    ''')
    conn.commit()
    conn.close()
    
if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
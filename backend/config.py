import urllib.parse

class Config:
    DB_USERNAME = 'remote'
    DB_PASSWORD = '520@111zz'  # 包含特殊字符 @，需要 URL 编码为 %40
    DB_HOST = '172.23.166.117'  # 或远程 IP 地址
    DB_NAME = 'course'  # 默认数据库名，你可以修改
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{urllib.parse.quote(DB_PASSWORD)}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    def __init__(self):
        self.DEBUG = True
        self.TESTING = False
        self.SECRET_KEY = 'your_secret_key'
        
class Development(Config):
    def __init__(self):
        super().__init__()
        self.DEBUG = True
        self.DATABASE_URI = 'db/dev.db'
        
class Testing(Config):
    def __init__(self):
        super().__init__()
        self.DEBUG = False  
        self.TESTING = True
        self.DATABASE_URI = 'db/test.db'
        
class Production(Config):
    def __init__(self):
        super().__init__()
        self.DEBUG = False
        self.DATABASE_URI = 'db/prod.db'
        
configs = {
    'development': Development(),
    'testing': Testing(),
    'production': Production()
}
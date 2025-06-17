
class Config:
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
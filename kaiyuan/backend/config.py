import urllib.parse

class Config:
    DB_USERNAME = 'remote'
    DB_PASSWORD = '520@111zz'  # 包含特殊字符 @，需要 URL 编码为 %40
    DB_HOST = '172.23.166.117'      # 或远程 IP 地址
    DB_NAME = 'course'     # 默认数据库名，你可以修改
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{urllib.parse.quote(DB_PASSWORD)}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
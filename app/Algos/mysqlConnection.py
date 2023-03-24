from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine("mysql+mysqldb://admin:master11@likush-db1.cm6r8mlpzeac.ap-south-1.rds.amazonaws.com/btc_history", pool_size=50, poolclass=QueuePool)

connection = engine.connect()  

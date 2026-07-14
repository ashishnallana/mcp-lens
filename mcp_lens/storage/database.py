from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()

class RequestHistory(Base):
    __tablename__ = 'request_history'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    client_id = Column(String, index=True, nullable=True)
    tool_name = Column(String, index=True)
    arguments = Column(JSON)
    response = Column(JSON, nullable=True)
    error = Column(String, nullable=True)
    duration_ms = Column(Float)
    status = Column(String) # "success" or "error"

engine = create_engine(
    "sqlite:///./mcp_lens.db", connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

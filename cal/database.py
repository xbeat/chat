"""
Configurazione del database per il modulo calendario.
"""
import logging
from common.db.base import create_base_for_schema, ensure_schema_exists
from common.config import CAL_SCHEMA
from contextlib import contextmanager

# Configura il logging
logger = logging.getLogger(__name__)

# Crea la base SQLAlchemy, engine e sessioni per lo schema del calendario
Base, engine, SessionLocal = create_base_for_schema(CAL_SCHEMA)

# Assicura che lo schema esista
ensure_schema_exists(engine, CAL_SCHEMA)

def get_db():
    """
    Funzione helper per ottenere una sessione del database.
    Da utilizzare come dipendenza nelle route.
    
    Yields:
        Session: Sessione SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
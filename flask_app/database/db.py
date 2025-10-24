from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, joinedload
from datetime import datetime
from sqlalchemy.sql import func

DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "tarea2"

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class Region(Base):
    __tablename__ = "region"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

    comunas = relationship("Comuna", back_populates="region")

class Comuna(Base):
    __tablename__ = "comuna"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False)

    region = relationship("Region", back_populates="comunas")
    avisos = relationship("AvisoAdopcion", back_populates="comuna")

class AvisoAdopcion(Base):
    __tablename__ = "aviso_adopcion"
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha_ingreso = Column(DateTime, default=datetime.now, nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    sector = Column(String(100))
    nombre = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False)
    celular = Column(String(15))
    tipo = Column(Enum("gato", "perro"))
    cantidad = Column(Integer, nullable=False)
    edad = Column(Integer, nullable=False)
    unidad_medida = Column(Enum("a", "m"))
    fecha_entrega = Column(DateTime, nullable=False)
    descripcion = Column(Text(500))

    comuna = relationship("Comuna", back_populates="avisos")
    fotos = relationship("Foto", back_populates="aviso", cascade="all, delete-orphan")
    contactos = relationship("ContactarPor", back_populates="aviso", cascade="all, delete-orphan")
    comentarios = relationship("Comentario", back_populates="aviso", cascade="all, delete-orphan")

class Foto(Base):
    __tablename__ = "foto"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    aviso_id = Column(Integer, ForeignKey("aviso_adopcion.id"), nullable=False)

    aviso = relationship("AvisoAdopcion", back_populates="fotos")

class ContactarPor(Base):
    __tablename__ = "contactar_por"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(Enum("whatsapp", "telegram", "X", "instagram", "tiktok", "otra"), nullable=False)
    identificador = Column(String(150), nullable=False)
    aviso_id = Column(Integer, ForeignKey("aviso_adopcion.id"), nullable=False)

    aviso = relationship("AvisoAdopcion", back_populates="contactos")

class Comentario(Base):
    __tablename__ = "comentario"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)
    texto = Column(String(300), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    aviso_id = Column(Integer, ForeignKey("aviso_adopcion.id"), nullable=False)

    aviso = relationship("AvisoAdopcion", back_populates="comentarios")

def get_session():
    """Devuelve una sesión nueva."""
    return SessionLocal()

def obtener_ultimos_avisos(n=5):
    """Obtiene los últimos n avisos"""
    session = get_session()
    avisos = (
        session.query(AvisoAdopcion)
        .options(joinedload(AvisoAdopcion.comuna))
        .options(joinedload(AvisoAdopcion.fotos))
        .options(joinedload(AvisoAdopcion.contactos))
        .order_by(AvisoAdopcion.fecha_ingreso.desc())
        .limit(n)
        .all()
    )
    session.close()
    return avisos

def crear_aviso(data, fotos=None, contactos=None):
    """Inserta un aviso y sus datos"""
    session = get_session()
    try:
        aviso = AvisoAdopcion(**data)
        session.add(aviso)
        session.flush()

        if fotos:
            for f in fotos:
                session.add(Foto(aviso_id=aviso.id, **f))
        if contactos:
            for c in contactos:
                session.add(ContactarPor(aviso_id=aviso.id, **c))

        session.commit()
        return aviso.id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

def obtener_aviso_por_id(aviso_id):
    """Busca un aviso por ID"""
    session = get_session()
    aviso = (
        session.query(AvisoAdopcion)
        .options(joinedload(AvisoAdopcion.comuna))
        .options(joinedload(AvisoAdopcion.fotos))
        .options(joinedload(AvisoAdopcion.contactos))
        .filter_by(id=aviso_id)
        .first()
    )
    session.close()
    return aviso

def contar_avisos():
    """Cuenta el total de avisos en la base de datos"""
    session = get_session()
    total = session.query(AvisoAdopcion).count()
    session.close()
    return total


def obtener_avisos_paginados(pagina, por_pagina):
    """Obtiene avisos con paginación"""
    session = get_session()
    offset = (pagina - 1) * por_pagina

    avisos = (
        session.query(AvisoAdopcion)
        .options(joinedload(AvisoAdopcion.comuna))
        .options(joinedload(AvisoAdopcion.fotos))
        .options(joinedload(AvisoAdopcion.contactos))
        .order_by(AvisoAdopcion.fecha_ingreso.desc())
        .offset(offset)
        .limit(por_pagina)
        .all()
    )

    session.close()
    return avisos

def crear_comentario(aviso_id, nombre, texto):
    """Crea un nuevo comentario en la base de datos."""
    session = get_session()
    try:
        comentario = Comentario(
            aviso_id=aviso_id,
            nombre=nombre,
            texto=texto,
            fecha=datetime.now()
        )
        session.add(comentario)
        session.commit()
        return comentario.id
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def obtener_comentarios_por_aviso(aviso_id):
    """Obtiene todos los comentarios de un aviso ordenados por fecha descendente."""
    session = get_session()
    comentarios = (
        session.query(Comentario)
        .filter_by(aviso_id=aviso_id)
        .order_by(Comentario.fecha.desc())
        .all()
    )
    session.close()
    return comentarios

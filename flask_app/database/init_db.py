from db import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print("✅ Tablas creadas correctamente en la base de datos 'tarea2'.")

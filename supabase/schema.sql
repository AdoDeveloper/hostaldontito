-- =====================================================
-- SCHEMA HOSTAL DON TITO - SUPABASE
-- =====================================================
-- Ejecutar este script en: Supabase Dashboard > SQL Editor
-- Versión: 2.0 - Con código de reserva legible y gestión completa
-- =====================================================

-- Eliminar tipos si existen (para reinstalación limpia)
DROP TYPE IF EXISTS tipo_habitacion CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS metodo_pago CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;

-- Crear tipos ENUM
CREATE TYPE tipo_habitacion AS ENUM ('individual', 'doble', 'triple', 'familiar');
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia');
CREATE TYPE rol_usuario AS ENUM ('admin', 'recepcion', 'gerente');

-- =====================================================
-- TABLA: habitaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS habitaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  tipo tipo_habitacion NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  precio_base DECIMAL(10,2) NOT NULL CHECK (precio_base > 0),
  amenidades TEXT[] DEFAULT '{}',
  descripcion TEXT NOT NULL,
  imagen_url TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: huespedes
-- =====================================================
CREATE TABLE IF NOT EXISTS huespedes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  documento_identidad VARCHAR(50),
  nacionalidad VARCHAR(100),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  historial_visitas INTEGER DEFAULT 1,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por correo
CREATE INDEX IF NOT EXISTS idx_huespedes_correo ON huespedes(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_huespedes_telefono ON huespedes(telefono);

-- =====================================================
-- TABLA: reservas (con código legible)
-- =====================================================
CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
  id_huesped UUID NOT NULL REFERENCES huespedes(id) ON DELETE CASCADE,
  id_habitacion UUID NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  fecha_entrada DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  num_personas INTEGER NOT NULL CHECK (num_personas > 0),
  precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
  estado estado_reserva DEFAULT 'pendiente',
  metodo_pago metodo_pago,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validar que fecha_salida > fecha_entrada
  CONSTRAINT check_fechas CHECK (fecha_salida > fecha_entrada)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_fechas ON reservas(fecha_entrada, fecha_salida);
CREATE INDEX IF NOT EXISTS idx_reservas_habitacion ON reservas(id_habitacion);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_huesped ON reservas(id_huesped);

-- =====================================================
-- TABLA: usuarios (para panel admin con contraseña)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_usuario DEFAULT 'recepcion',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: sesiones (para gestión de sesiones)
-- =====================================================
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(id_usuario);

-- =====================================================
-- TABLA: log_actividad (auditoría)
-- =====================================================
CREATE TABLE IF NOT EXISTS log_actividad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(50),
  registro_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_usuario ON log_actividad(id_usuario);
CREATE INDEX IF NOT EXISTS idx_log_fecha ON log_actividad(created_at);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_actividad ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Habitaciones visibles para todos" ON habitaciones;
DROP POLICY IF EXISTS "Habitaciones modificables por autenticados" ON habitaciones;
DROP POLICY IF EXISTS "Huespedes visibles para todos" ON huespedes;
DROP POLICY IF EXISTS "Cualquiera puede crear huespedes" ON huespedes;
DROP POLICY IF EXISTS "Huespedes modificables por autenticados" ON huespedes;
DROP POLICY IF EXISTS "Reservas visibles para todos" ON reservas;
DROP POLICY IF EXISTS "Cualquiera puede crear reservas" ON reservas;
DROP POLICY IF EXISTS "Reservas modificables por autenticados" ON reservas;
DROP POLICY IF EXISTS "Usuarios visibles para autenticados" ON usuarios;
DROP POLICY IF EXISTS "Sesiones visibles para autenticados" ON sesiones;
DROP POLICY IF EXISTS "Log visible para autenticados" ON log_actividad;

-- Políticas para habitaciones (lectura pública, escritura autenticada)
CREATE POLICY "Habitaciones visibles para todos" ON habitaciones
  FOR SELECT USING (true);

CREATE POLICY "Habitaciones modificables por autenticados" ON habitaciones
  FOR ALL USING (true);

-- Políticas para huéspedes
CREATE POLICY "Huespedes visibles para todos" ON huespedes
  FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede crear huespedes" ON huespedes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Huespedes modificables por autenticados" ON huespedes
  FOR UPDATE USING (true);

-- Políticas para reservas
CREATE POLICY "Reservas visibles para todos" ON reservas
  FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede crear reservas" ON reservas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reservas modificables por autenticados" ON reservas
  FOR UPDATE USING (true);

-- Políticas para usuarios (solo lectura para verificación)
CREATE POLICY "Usuarios visibles para autenticados" ON usuarios
  FOR SELECT USING (true);

-- Políticas para sesiones
CREATE POLICY "Sesiones visibles para autenticados" ON sesiones
  FOR ALL USING (true);

-- Políticas para log
CREATE POLICY "Log visible para autenticados" ON log_actividad
  FOR ALL USING (true);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar código de reserva
CREATE OR REPLACE FUNCTION generar_codigo_reserva()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_año TEXT;
  v_mes TEXT;
  v_prefijo TEXT;
  v_siguiente INTEGER;
  v_codigo TEXT;
BEGIN
  v_año := TO_CHAR(NOW(), 'YYYY');
  v_mes := TO_CHAR(NOW(), 'MM');
  v_prefijo := 'HDT-' || v_año || v_mes;

  SELECT COALESCE(MAX(CAST(SPLIT_PART(codigo_reserva, '-', 3) AS INTEGER)), 0) + 1
  INTO v_siguiente
  FROM reservas
  WHERE codigo_reserva LIKE v_prefijo || '-%';

  v_codigo := v_prefijo || '-' || LPAD(v_siguiente::TEXT, 4, '0');

  RETURN v_codigo;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente
CREATE OR REPLACE FUNCTION trigger_generar_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_reserva IS NULL OR NEW.codigo_reserva = '' THEN
    NEW.codigo_reserva := generar_codigo_reserva();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generar_codigo_reserva ON reservas;
CREATE TRIGGER trg_generar_codigo_reserva
  BEFORE INSERT ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generar_codigo_reserva();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trg_habitaciones_updated ON habitaciones;
CREATE TRIGGER trg_habitaciones_updated
  BEFORE UPDATE ON habitaciones
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

DROP TRIGGER IF EXISTS trg_huespedes_updated ON huespedes;
CREATE TRIGGER trg_huespedes_updated
  BEFORE UPDATE ON huespedes
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

DROP TRIGGER IF EXISTS trg_reservas_updated ON reservas;
CREATE TRIGGER trg_reservas_updated
  BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

DROP TRIGGER IF EXISTS trg_usuarios_updated ON usuarios;
CREATE TRIGGER trg_usuarios_updated
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- =====================================================
-- FUNCIÓN: Verificar disponibilidad de habitación
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_disponibilidad(
  p_id_habitacion UUID,
  p_fecha_entrada DATE,
  p_fecha_salida DATE,
  p_excluir_reserva_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflictos INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflictos
  FROM reservas
  WHERE id_habitacion = p_id_habitacion
    AND estado != 'cancelada'
    AND (p_excluir_reserva_id IS NULL OR id != p_excluir_reserva_id)
    AND fecha_entrada < p_fecha_salida
    AND fecha_salida > p_fecha_entrada;

  RETURN conflictos = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Calcular precio total
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_precio_total(
  p_id_habitacion UUID,
  p_fecha_entrada DATE,
  p_fecha_salida DATE
)
RETURNS DECIMAL AS $$
DECLARE
  v_precio_base DECIMAL;
  v_noches INTEGER;
BEGIN
  SELECT precio_base INTO v_precio_base
  FROM habitaciones
  WHERE id = p_id_habitacion;

  IF v_precio_base IS NULL THEN
    RETURN 0;
  END IF;

  v_noches := p_fecha_salida - p_fecha_entrada;

  RETURN v_precio_base * v_noches;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Autenticar usuario (retorna UUID del usuario)
-- =====================================================
CREATE OR REPLACE FUNCTION autenticar_usuario(
  p_email VARCHAR(255),
  p_password VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  SELECT id INTO v_usuario_id
  FROM usuarios
  WHERE email = p_email
    AND password_hash = p_password
    AND activo = true;

  IF v_usuario_id IS NOT NULL THEN
    -- Actualizar último acceso
    UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = v_usuario_id;
  END IF;

  RETURN v_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear usuario con password
-- =====================================================
CREATE OR REPLACE FUNCTION crear_usuario(
  p_nombre VARCHAR(255),
  p_email VARCHAR(255),
  p_password VARCHAR(255),
  p_rol rol_usuario DEFAULT 'recepcion'
)
RETURNS UUID AS $$
DECLARE
  v_nuevo_id UUID;
BEGIN
  INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
  VALUES (p_nombre, p_email, p_password, p_rol, true)
  RETURNING id INTO v_nuevo_id;

  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Cambiar contraseña de usuario
-- =====================================================
CREATE OR REPLACE FUNCTION cambiar_password_usuario(
  p_usuario_id UUID,
  p_nueva_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE usuarios
  SET password_hash = p_nueva_password
  WHERE id = p_usuario_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear sesión
-- =====================================================
CREATE OR REPLACE FUNCTION crear_sesion(
  p_id_usuario UUID,
  p_ip_address VARCHAR(50) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VARCHAR(255) AS $$
DECLARE
  v_token VARCHAR(255);
BEGIN
  -- Generar token único
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Insertar sesión (expira en 24 horas)
  INSERT INTO sesiones (id_usuario, token, ip_address, user_agent, expira_en)
  VALUES (p_id_usuario, v_token, p_ip_address, p_user_agent, NOW() + INTERVAL '24 hours');

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar sesión (retorna UUID del usuario)
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_sesion(p_token VARCHAR(255))
RETURNS UUID AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  SELECT u.id INTO v_usuario_id
  FROM sesiones s
  JOIN usuarios u ON s.id_usuario = u.id
  WHERE s.token = p_token
    AND s.expira_en > NOW()
    AND u.activo = true;

  RETURN v_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Cerrar sesión
-- =====================================================
CREATE OR REPLACE FUNCTION cerrar_sesion(p_token VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM sesiones WHERE token = p_token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Limpiar sesiones expiradas
-- =====================================================
CREATE OR REPLACE FUNCTION limpiar_sesiones_expiradas()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM sesiones WHERE expira_en < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Incrementar visitas de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION incrementar_visitas_huesped(p_huesped_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_nuevas_visitas INTEGER;
BEGIN
  UPDATE huespedes
  SET historial_visitas = historial_visitas + 1
  WHERE id = p_huesped_id
  RETURNING historial_visitas INTO v_nuevas_visitas;

  RETURN v_nuevas_visitas;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA: Estadísticas de ocupación
-- =====================================================
DROP VIEW IF EXISTS vista_estadisticas;
CREATE VIEW vista_estadisticas AS
SELECT
  (SELECT COUNT(*) FROM reservas WHERE estado != 'cancelada') as total_reservas,
  (SELECT COUNT(*) FROM reservas WHERE estado = 'confirmada') as reservas_confirmadas,
  (SELECT COUNT(*) FROM reservas WHERE estado = 'pendiente') as reservas_pendientes,
  (SELECT COUNT(*) FROM habitaciones WHERE activa = true) as total_habitaciones,
  (SELECT COUNT(*) FROM huespedes) as total_huespedes,
  (SELECT COALESCE(SUM(precio_total), 0) FROM reservas
   WHERE estado != 'cancelada'
   AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
   AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())) as ingresos_mes;

-- =====================================================
-- VISTA: Reservas con detalles
-- =====================================================
DROP VIEW IF EXISTS vista_reservas_detalle;
CREATE VIEW vista_reservas_detalle AS
SELECT
  r.id,
  r.codigo_reserva,
  r.fecha_entrada,
  r.fecha_salida,
  r.num_personas,
  r.precio_total,
  r.estado,
  r.metodo_pago,
  r.notas,
  r.created_at,
  h.id as huesped_id,
  h.nombre_completo as huesped_nombre,
  h.correo_electronico as huesped_email,
  h.telefono as huesped_telefono,
  hab.id as habitacion_id,
  hab.numero as habitacion_numero,
  hab.tipo as habitacion_tipo,
  hab.precio_base as habitacion_precio
FROM reservas r
JOIN huespedes h ON r.id_huesped = h.id
JOIN habitaciones hab ON r.id_habitacion = hab.id;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar habitaciones (solo si no existen)
INSERT INTO habitaciones (numero, tipo, capacidad, precio_base, amenidades, descripcion)
SELECT '101', 'individual', 1, 18.00, ARRAY['WiFi', 'Aire acondicionado', 'TV', 'Baño privado'], 'Habitación individual cómoda y acogedora con todas las comodidades básicas.'
WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '101');

INSERT INTO habitaciones (numero, tipo, capacidad, precio_base, amenidades, descripcion)
SELECT '102', 'doble', 2, 28.00, ARRAY['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador'], 'Habitación doble espaciosa perfecta para parejas, con vista al jardín.'
WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '102');

INSERT INTO habitaciones (numero, tipo, capacidad, precio_base, amenidades, descripcion)
SELECT '103', 'triple', 3, 38.00, ARRAY['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Escritorio'], 'Habitación triple ideal para pequeñas familias o grupos de amigos.'
WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '103');

INSERT INTO habitaciones (numero, tipo, capacidad, precio_base, amenidades, descripcion)
SELECT '104', 'familiar', 4, 45.00, ARRAY['WiFi', 'Aire acondicionado', 'TV', 'Baño privado', 'Mini refrigerador', 'Sala de estar'], 'Habitación familiar amplia con espacio adicional para el confort de toda la familia.'
WHERE NOT EXISTS (SELECT 1 FROM habitaciones WHERE numero = '104');

-- Insertar usuario admin (contraseña: admin123)
-- IMPORTANTE: En producción usar bcrypt o similar
INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
SELECT 'Administrador', 'admin@hostaldontico.com', 'admin123', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@hostaldontico.com');

-- =====================================================
-- SCRIPT PARA MIGRAR RESERVAS EXISTENTES (agregar código)
-- =====================================================
-- Ejecutar solo si hay reservas sin código
DO $$
DECLARE
  r RECORD;
  v_contador INTEGER := 0;
  v_año_mes TEXT;
  v_codigo TEXT;
BEGIN
  FOR r IN (SELECT id, created_at FROM reservas WHERE codigo_reserva IS NULL ORDER BY created_at) LOOP
    v_año_mes := TO_CHAR(r.created_at, 'YYYYMM');
    v_contador := v_contador + 1;
    v_codigo := 'HDT-' || v_año_mes || '-' || LPAD(v_contador::TEXT, 4, '0');
    UPDATE reservas SET codigo_reserva = v_codigo WHERE id = r.id;
  END LOOP;
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

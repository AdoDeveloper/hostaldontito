-- =====================================================
-- SCHEMA COMPLETO - HOSTAL DON TITO
-- =====================================================
-- Ejecutar este script en: Supabase Dashboard > SQL Editor
-- Versión: 3.0 - Sistema completo con cuentas de huéspedes
-- Ubicación: Izalco, Sonsonate, El Salvador
-- =====================================================

-- =====================================================
-- LIMPIEZA INICIAL (para reinstalación limpia)
-- =====================================================
DROP VIEW IF EXISTS vista_estadisticas CASCADE;
DROP VIEW IF EXISTS vista_reservas_detalle CASCADE;

DROP TABLE IF EXISTS tokens_recuperacion CASCADE;
DROP TABLE IF EXISTS sesiones_huespedes CASCADE;
DROP TABLE IF EXISTS cuentas_huespedes CASCADE;
DROP TABLE IF EXISTS log_actividad CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS huespedes CASCADE;
DROP TABLE IF EXISTS habitaciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS tipo_habitacion CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS metodo_pago CASCADE;
DROP TYPE IF EXISTS rol_usuario CASCADE;

-- =====================================================
-- CREAR TIPOS ENUM
-- =====================================================
CREATE TYPE tipo_habitacion AS ENUM ('individual', 'doble', 'triple', 'familiar');
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia');
CREATE TYPE rol_usuario AS ENUM ('admin', 'recepcion', 'gerente');

-- =====================================================
-- TABLA: habitaciones
-- =====================================================
CREATE TABLE habitaciones (
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
CREATE TABLE huespedes (
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

CREATE INDEX idx_huespedes_correo ON huespedes(correo_electronico);
CREATE INDEX idx_huespedes_telefono ON huespedes(telefono);

-- =====================================================
-- TABLA: reservas
-- =====================================================
CREATE TABLE reservas (
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
  CONSTRAINT check_fechas CHECK (fecha_salida > fecha_entrada)
);

CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_fechas ON reservas(fecha_entrada, fecha_salida);
CREATE INDEX idx_reservas_habitacion ON reservas(id_habitacion);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_huesped ON reservas(id_huesped);

-- =====================================================
-- TABLA: usuarios (panel administrativo)
-- =====================================================
CREATE TABLE usuarios (
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
-- TABLA: sesiones (sesiones de administradores)
-- =====================================================
CREATE TABLE sesiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_usuario ON sesiones(id_usuario);

-- =====================================================
-- TABLA: log_actividad (auditoría)
-- =====================================================
CREATE TABLE log_actividad (
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

CREATE INDEX idx_log_usuario ON log_actividad(id_usuario);
CREATE INDEX idx_log_fecha ON log_actividad(created_at);

-- =====================================================
-- TABLA: cuentas_huespedes (login de huéspedes)
-- =====================================================
CREATE TABLE cuentas_huespedes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_huesped UUID NOT NULL REFERENCES huespedes(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  verificado BOOLEAN DEFAULT false,
  token_verificacion VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cuentas_huespedes_email ON cuentas_huespedes(email);
CREATE INDEX idx_cuentas_huespedes_huesped ON cuentas_huespedes(id_huesped);

-- =====================================================
-- TABLA: tokens_recuperacion (recuperar contraseña)
-- =====================================================
CREATE TABLE tokens_recuperacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_cuenta UUID NOT NULL REFERENCES cuentas_huespedes(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT false,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tokens_recuperacion_token ON tokens_recuperacion(token);

-- =====================================================
-- TABLA: sesiones_huespedes (sesiones de clientes)
-- =====================================================
CREATE TABLE sesiones_huespedes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_cuenta UUID NOT NULL REFERENCES cuentas_huespedes(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sesiones_huespedes_token ON sesiones_huespedes(token);
CREATE INDEX idx_sesiones_huespedes_cuenta ON sesiones_huespedes(id_cuenta);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_recuperacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_huespedes ENABLE ROW LEVEL SECURITY;

-- Políticas para habitaciones
CREATE POLICY "Habitaciones visibles para todos" ON habitaciones FOR SELECT USING (true);
CREATE POLICY "Habitaciones modificables" ON habitaciones FOR ALL USING (true);

-- Políticas para huéspedes
CREATE POLICY "Huespedes visibles para todos" ON huespedes FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede crear huespedes" ON huespedes FOR INSERT WITH CHECK (true);
CREATE POLICY "Huespedes modificables" ON huespedes FOR UPDATE USING (true);

-- Políticas para reservas
CREATE POLICY "Reservas visibles para todos" ON reservas FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede crear reservas" ON reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Reservas modificables" ON reservas FOR UPDATE USING (true);

-- Políticas para usuarios
CREATE POLICY "Usuarios visibles" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Usuarios insertables" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios modificables" ON usuarios FOR UPDATE USING (true);

-- Políticas para sesiones admin
CREATE POLICY "Sesiones accesibles" ON sesiones FOR ALL USING (true);

-- Políticas para log
CREATE POLICY "Log accesible" ON log_actividad FOR ALL USING (true);

-- Políticas para cuentas de huéspedes
CREATE POLICY "Cuentas huespedes visibles" ON cuentas_huespedes FOR SELECT USING (true);
CREATE POLICY "Cuentas huespedes insertables" ON cuentas_huespedes FOR INSERT WITH CHECK (true);
CREATE POLICY "Cuentas huespedes modificables" ON cuentas_huespedes FOR UPDATE USING (true);

-- Políticas para tokens de recuperación
CREATE POLICY "Tokens visibles" ON tokens_recuperacion FOR SELECT USING (true);
CREATE POLICY "Tokens insertables" ON tokens_recuperacion FOR INSERT WITH CHECK (true);
CREATE POLICY "Tokens modificables" ON tokens_recuperacion FOR UPDATE USING (true);
CREATE POLICY "Tokens eliminables" ON tokens_recuperacion FOR DELETE USING (true);

-- Políticas para sesiones de huéspedes
CREATE POLICY "Sesiones huespedes accesibles" ON sesiones_huespedes FOR ALL USING (true);

-- =====================================================
-- FUNCIÓN: Trigger updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trg_habitaciones_updated BEFORE UPDATE ON habitaciones
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_huespedes_updated BEFORE UPDATE ON huespedes
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_reservas_updated BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_usuarios_updated BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

CREATE TRIGGER trg_cuentas_huespedes_updated BEFORE UPDATE ON cuentas_huespedes
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- =====================================================
-- FUNCIÓN: Generar código de reserva (HDT-YYYYMM-XXXX)
-- =====================================================
CREATE OR REPLACE FUNCTION generar_codigo_reserva()
RETURNS VARCHAR(20) AS $$
DECLARE
  v_prefijo TEXT;
  v_siguiente INTEGER;
BEGIN
  v_prefijo := 'HDT-' || TO_CHAR(NOW(), 'YYYYMM');

  SELECT COALESCE(MAX(CAST(SPLIT_PART(codigo_reserva, '-', 3) AS INTEGER)), 0) + 1
  INTO v_siguiente
  FROM reservas
  WHERE codigo_reserva LIKE v_prefijo || '-%';

  RETURN v_prefijo || '-' || LPAD(v_siguiente::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_generar_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_reserva IS NULL OR NEW.codigo_reserva = '' THEN
    NEW.codigo_reserva := generar_codigo_reserva();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generar_codigo_reserva BEFORE INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION trigger_generar_codigo_reserva();

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
  SELECT precio_base INTO v_precio_base FROM habitaciones WHERE id = p_id_habitacion;
  IF v_precio_base IS NULL THEN RETURN 0; END IF;
  v_noches := p_fecha_salida - p_fecha_entrada;
  RETURN v_precio_base * v_noches;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Autenticar usuario (admin)
-- =====================================================
CREATE OR REPLACE FUNCTION autenticar_usuario(
  p_email VARCHAR(255),
  p_password VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  SELECT id INTO v_usuario_id FROM usuarios
  WHERE email = p_email AND password_hash = p_password AND activo = true;

  IF v_usuario_id IS NOT NULL THEN
    UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = v_usuario_id;
  END IF;

  RETURN v_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear usuario
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
  UPDATE usuarios SET password_hash = p_nueva_password WHERE id = p_usuario_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear sesión (admin)
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
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sesiones (id_usuario, token, ip_address, user_agent, expira_en)
  VALUES (p_id_usuario, v_token, p_ip_address, p_user_agent, NOW() + INTERVAL '24 hours');
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar sesión (admin)
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_sesion(p_token VARCHAR(255))
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT u.id FROM sesiones s
    JOIN usuarios u ON s.id_usuario = u.id
    WHERE s.token = p_token AND s.expira_en > NOW() AND u.activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Cerrar sesión (admin)
-- =====================================================
CREATE OR REPLACE FUNCTION cerrar_sesion(p_token VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM sesiones WHERE token = p_token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Incrementar visitas de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION incrementar_visitas_huesped(p_huesped_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_nuevas_visitas INTEGER;
BEGIN
  UPDATE huespedes SET historial_visitas = historial_visitas + 1
  WHERE id = p_huesped_id
  RETURNING historial_visitas INTO v_nuevas_visitas;
  RETURN v_nuevas_visitas;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Registrar cuenta de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_cuenta_huesped(
  p_nombre VARCHAR(255),
  p_email VARCHAR(255),
  p_telefono VARCHAR(20),
  p_password VARCHAR(255)
)
RETURNS TABLE(cuenta_id UUID, huesped_id UUID) AS $$
DECLARE
  v_huesped_id UUID;
  v_cuenta_id UUID;
BEGIN
  -- Verificar si ya existe cuenta con ese email
  IF EXISTS (SELECT 1 FROM cuentas_huespedes WHERE email = p_email) THEN
    RAISE EXCEPTION 'Ya existe una cuenta con este correo electrónico';
  END IF;

  -- Buscar o crear huésped
  SELECT id INTO v_huesped_id FROM huespedes WHERE correo_electronico = p_email;

  IF v_huesped_id IS NULL THEN
    INSERT INTO huespedes (nombre_completo, correo_electronico, telefono)
    VALUES (p_nombre, p_email, p_telefono)
    RETURNING id INTO v_huesped_id;
  ELSE
    UPDATE huespedes SET nombre_completo = p_nombre, telefono = p_telefono
    WHERE id = v_huesped_id;
  END IF;

  -- Crear cuenta
  INSERT INTO cuentas_huespedes (id_huesped, email, password_hash, verificado)
  VALUES (v_huesped_id, p_email, p_password, true)
  RETURNING id INTO v_cuenta_id;

  RETURN QUERY SELECT v_cuenta_id, v_huesped_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Autenticar huésped
-- =====================================================
CREATE OR REPLACE FUNCTION autenticar_huesped(
  p_email VARCHAR(255),
  p_password VARCHAR(255)
)
RETURNS TABLE(
  cuenta_id UUID,
  huesped_id UUID,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, h.id, h.nombre_completo, h.correo_electronico, h.telefono
  FROM cuentas_huespedes c
  JOIN huespedes h ON c.id_huesped = h.id
  WHERE c.email = p_email AND c.password_hash = p_password AND c.activo = true;

  UPDATE cuentas_huespedes SET ultimo_acceso = NOW()
  WHERE cuentas_huespedes.email = p_email AND password_hash = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear sesión de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION crear_sesion_huesped(
  p_id_cuenta UUID,
  p_ip_address VARCHAR(50) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VARCHAR(255) AS $$
DECLARE
  v_token VARCHAR(255);
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');
  INSERT INTO sesiones_huespedes (id_cuenta, token, ip_address, user_agent, expira_en)
  VALUES (p_id_cuenta, v_token, p_ip_address, p_user_agent, NOW() + INTERVAL '7 days');
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar sesión de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_sesion_huesped(p_token VARCHAR(255))
RETURNS TABLE(
  cuenta_id UUID,
  huesped_id UUID,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20),
  documento_identidad VARCHAR(50),
  nacionalidad VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, h.id, h.nombre_completo, h.correo_electronico, h.telefono,
         h.documento_identidad, h.nacionalidad
  FROM sesiones_huespedes s
  JOIN cuentas_huespedes c ON s.id_cuenta = c.id
  JOIN huespedes h ON c.id_huesped = h.id
  WHERE s.token = p_token AND s.expira_en > NOW() AND c.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Cerrar sesión de huésped
-- =====================================================
CREATE OR REPLACE FUNCTION cerrar_sesion_huesped(p_token VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM sesiones_huespedes WHERE token = p_token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Crear token de recuperación
-- =====================================================
CREATE OR REPLACE FUNCTION crear_token_recuperacion(p_email VARCHAR(255))
RETURNS VARCHAR(255) AS $$
DECLARE
  v_cuenta_id UUID;
  v_token VARCHAR(255);
BEGIN
  SELECT id INTO v_cuenta_id FROM cuentas_huespedes WHERE email = p_email AND activo = true;

  IF v_cuenta_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Invalidar tokens anteriores
  UPDATE tokens_recuperacion SET usado = true
  WHERE id_cuenta = v_cuenta_id AND usado = false;

  -- Generar nuevo token
  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO tokens_recuperacion (id_cuenta, token, expira_en)
  VALUES (v_cuenta_id, v_token, NOW() + INTERVAL '1 hour');

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Verificar token de recuperación
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_token_recuperacion(p_token VARCHAR(255))
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id_cuenta FROM tokens_recuperacion
    WHERE token = p_token AND usado = false AND expira_en > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Restablecer contraseña con token
-- =====================================================
CREATE OR REPLACE FUNCTION restablecer_password_huesped(
  p_token VARCHAR(255),
  p_nueva_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_cuenta_id UUID;
BEGIN
  SELECT id_cuenta INTO v_cuenta_id FROM tokens_recuperacion
  WHERE token = p_token AND usado = false AND expira_en > NOW();

  IF v_cuenta_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE cuentas_huespedes SET password_hash = p_nueva_password WHERE id = v_cuenta_id;
  UPDATE tokens_recuperacion SET usado = true WHERE token = p_token;
  DELETE FROM sesiones_huespedes WHERE id_cuenta = v_cuenta_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Obtener reservas de un huésped
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_reservas_huesped(p_huesped_id UUID)
RETURNS TABLE(
  id UUID,
  codigo_reserva VARCHAR(20),
  fecha_entrada DATE,
  fecha_salida DATE,
  num_personas INTEGER,
  precio_total DECIMAL,
  estado estado_reserva,
  habitacion_numero VARCHAR(10),
  habitacion_tipo tipo_habitacion,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.codigo_reserva, r.fecha_entrada, r.fecha_salida, r.num_personas,
         r.precio_total, r.estado, h.numero, h.tipo, r.created_at
  FROM reservas r
  JOIN habitaciones h ON r.id_habitacion = h.id
  WHERE r.id_huesped = p_huesped_id
  ORDER BY r.fecha_entrada DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Limpiar tokens y sesiones expiradas
-- =====================================================
CREATE OR REPLACE FUNCTION limpiar_sesiones_expiradas()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_temp INTEGER;
BEGIN
  DELETE FROM sesiones WHERE expira_en < NOW();
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_count := v_count + v_temp;

  DELETE FROM sesiones_huespedes WHERE expira_en < NOW();
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_count := v_count + v_temp;

  DELETE FROM tokens_recuperacion WHERE expira_en < NOW();
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_count := v_count + v_temp;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA: Estadísticas de ocupación
-- =====================================================
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
CREATE VIEW vista_reservas_detalle AS
SELECT
  r.id, r.codigo_reserva, r.fecha_entrada, r.fecha_salida, r.num_personas,
  r.precio_total, r.estado, r.metodo_pago, r.notas, r.created_at,
  h.id as huesped_id, h.nombre_completo as huesped_nombre,
  h.correo_electronico as huesped_email, h.telefono as huesped_telefono,
  hab.id as habitacion_id, hab.numero as habitacion_numero,
  hab.tipo as habitacion_tipo, hab.precio_base as habitacion_precio
FROM reservas r
JOIN huespedes h ON r.id_huesped = h.id
JOIN habitaciones hab ON r.id_habitacion = hab.id;

-- =====================================================
-- DATOS INICIALES: HABITACIONES
-- Hostal Don Tito - Izalco, Sonsonate, El Salvador
-- Precios en USD
-- =====================================================

INSERT INTO habitaciones (numero, tipo, capacidad, precio_base, amenidades, descripcion) VALUES
('1', 'individual', 1, 15.00,
  ARRAY['WiFi Gratis', 'Aire Acondicionado', 'TV Cable', 'Baño Privado'],
  'Habitación individual cómoda y acogedora, ideal para viajeros solos. Cuenta con todas las comodidades básicas para una estancia placentera.'),

('2', 'doble', 2, 25.00,
  ARRAY['WiFi Gratis', 'Aire Acondicionado', 'TV Cable', 'Baño Privado', 'Mini Refrigerador'],
  'Habitación doble espaciosa perfecta para parejas o dos amigos. Ambiente tranquilo con vista agradable.'),

('3', 'triple', 3, 35.00,
  ARRAY['WiFi Gratis', 'Aire Acondicionado', 'TV Cable', 'Baño Privado', 'Escritorio'],
  'Habitación triple ideal para pequeñas familias o grupos de amigos. Amplio espacio con todas las comodidades.'),

('4', 'familiar', 4, 45.00,
  ARRAY['WiFi Gratis', 'Aire Acondicionado', 'TV Cable', 'Baño Privado', 'Mini Refrigerador', 'Sala de Estar'],
  'Habitación familiar amplia con espacio adicional para el confort de toda la familia. La mejor opción para grupos grandes.');

-- =====================================================
-- DATOS INICIALES: USUARIO ADMINISTRADOR
-- Usuario: admin@hostaldontito.com
-- Contraseña: admin123 (cambiar en producción)
-- =====================================================

INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
('Administrador', 'admin@hostaldontito.com', 'admin123', 'admin', true);

-- =====================================================
-- FIN DEL SCHEMA COMPLETO
-- =====================================================
-- Para ejecutar: Copiar todo este contenido en
-- Supabase Dashboard > SQL Editor > New Query > Run
-- =====================================================

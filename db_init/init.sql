-- 4. Conectarse a la nueva base de datos para ejecutar los comandos restantes
\c arepas_db;

-- 5. Crear las tablas (el propietario será el usuario que las crea, 'postgres')
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name character varying(150) NOT NULL,
    email character varying(255) UNIQUE NOT NULL,
    password_hash character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active' NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    photo_url text
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    description text,
    price integer NOT NULL,
    stock integer NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    total numeric(10, 2) NOT NULL,
    coupon character varying(50),
    status character varying(50) DEFAULT 'PENDING' NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    paid_at timestamp without time zone
);

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code character varying(50) UNIQUE NOT NULL,
    discount_type character varying(20) NOT NULL, -- Ej: 'PERCENTAGE' o 'FIXED'
    discount_value integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,

    CONSTRAINT fk_order
        FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product
        FOREIGN KEY(product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
);

-- 6. Cambiar la propiedad de las tablas al usuario de la aplicación
ALTER TABLE users OWNER TO appuser;
ALTER TABLE products OWNER TO appuser;
ALTER TABLE orders OWNER TO appuser;
ALTER TABLE coupons OWNER TO appuser;
ALTER TABLE order_items OWNER TO appuser;

-- Es posible que también necesites cambiar la propiedad de las secuencias
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO appuser;


-- 7. Insertar datos iniciales
INSERT INTO users (name, email, password_hash, is_admin) VALUES
('Admin Arepabuelas', 'admin@arepabuelas.com', 'cd05ee9099b03ca5e73d6444603fa412$3b1b3d653ff370ad82ede99651ba6f2ed128c80578281200e83bf8127187f449', true);

INSERT INTO products (name, description, price, stock, image) VALUES
('Arepa de Queso', 'Deliciosa arepa rellena con abundante queso blanco fresco.', 5000, 50, 'url_a_la_imagen_queso.jpg'),
('Arepa de Carne Desmechada', 'Arepa rellena de jugosa carne de res desmechada y guisada.', 7000, 40, 'url_a_la_imagen_carne.jpg'),
('Arepa de Pollo', 'Sabrosa arepa con pechuga de pollo desmenuzada y sazonada.', 6500, 45, 'url_a_la_imagen_pollo.jpg'),
('Arepa Mixta', 'La combinación perfecta de carne desmechada y pollo.', 8000, 30, 'url_a_la_imagen_mixta.jpg'),
('Arepa de Reina Pepiada', 'Clásica arepa venezolana con una mezcla cremosa de pollo, aguacate y mayonesa.', 8500, 25, 'url_a_la_imagen_reina.jpg');
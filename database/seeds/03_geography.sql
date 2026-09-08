-- =============================================================
-- Seed 03 · Geography — Davao del Norte → Tagum City → barangays
-- Center points are approximate; boundaries omitted here
-- (import real PSGC boundary shapefiles before production).
-- =============================================================

INSERT INTO provinces (name, code) VALUES
    ('Davao del Norte', '112300000')
ON CONFLICT DO NOTHING;

INSERT INTO cities_municipalities (province_id, name, code, type)
SELECT p.id, 'Tagum City', '112304000', 'CITY'
  FROM provinces p
 WHERE p.name = 'Davao del Norte'
ON CONFLICT DO NOTHING;

-- Tagum City's 23 barangays with approximate centers (WGS 84)
INSERT INTO barangays (city_municipality_id, name, code, center_point, population)
SELECT cm.id, b.name, b.code,
       ST_SetSRID(ST_MakePoint(b.lon, b.lat), 4326),
       b.population
  FROM cities_municipalities cm,
       (VALUES
           ('Apokon',           '112304001', 7.4486, 125.8078, 45000),
           ('Bincungan',        '112304002', 7.4789, 125.8211, 12000),
           ('Busaon',           '112304003', 7.5103, 125.8394,  8000),
           ('Canocotan',        '112304004', 7.4312, 125.8345, 18000),
           ('Cuambogan',        '112304005', 7.4021, 125.8123, 15000),
           ('La Libertad',      '112304006', 7.4611, 125.7901, 10000),
           ('Liboganon',        '112304007', 7.5247, 125.8234,  9000),
           ('Magdum',           '112304008', 7.4395, 125.7956, 22000),
           ('Mankilam',         '112304009', 7.4156, 125.7934, 16000),
           ('New Balamban',     '112304010', 7.5334, 125.8012,  6000),
           ('Nueva Fuerza',     '112304011', 7.4478, 125.7723,  9000),
           ('Pagsabangan',      '112304012', 7.5012, 125.8656, 11000),
           ('Magugpo Poblacion','112304013', 7.4472, 125.8095, 15000),
           ('San Agustin',      '112304014', 7.4298, 125.7687, 13000),
           ('San Isidro',       '112304015', 7.4867, 125.7989,  9000),
           ('San Miguel (Camp)',    '112304016', 7.4534, 125.8189, 25000),
           ('Visayan Village',  '112304017', 7.4623, 125.8101, 40000),
           ('Madaum',           '112304018', 7.5121, 125.8534, 12000),
           ('Barcelona',        '112304019', 7.4567, 125.8267,  9000),
           ('Pandapan',         '112304020', 7.4376, 125.8198, 14000),
           ('Magugpo East',     '112304021', 7.4523, 125.8156, 20000),
           ('Magugpo North',    '112304022', 7.4589, 125.8067, 18000),
           ('Magugpo South',    '112304023', 7.4401, 125.8043, 21000)
       ) AS b(name, code, lat, lon, population)
 WHERE cm.name = 'Tagum City'
ON CONFLICT (city_municipality_id, name) DO UPDATE
    SET center_point = EXCLUDED.center_point,
        code         = EXCLUDED.code,
        population   = EXCLUDED.population;

-- Demo zones for Magugpo Poblacion (replace with real purok data)
INSERT INTO zones (barangay_id, name, code)
SELECT br.id, z.name, z.code
  FROM barangays br,
       (VALUES
           ('Purok 1', 'MP-01'),
           ('Purok 2', 'MP-02'),
           ('Purok 3', 'MP-03'),
           ('Zone 3',  'MP-Z3')
       ) AS z(name, code)
 WHERE br.name = 'Magugpo Poblacion'
ON CONFLICT (barangay_id, name) DO NOTHING;

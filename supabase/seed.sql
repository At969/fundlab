-- Catégories et produits de démonstration. Prix en francs CFA (XOF).
insert into categories (name) values
  ('Boulangerie'),
  ('Épicerie'),
  ('Boissons'),
  ('Produits frais');

insert into products (name, description, category_id, price_cents, stock)
select item.name, item.description, categories.id, item.price_cents, item.stock
from (values
  ('Pain de campagne', 'Pain au levain, cuit le matin même.', 'Boulangerie', 1500, 25),
  ('Baguette tradition', 'Farine locale, croûte croustillante.', 'Boulangerie', 200, 60),
  ('Croissant pur beurre', 'Vendu à l''unité.', 'Boulangerie', 500, 40),
  ('Café en grains 250 g', 'Arabica, torréfaction artisanale.', 'Épicerie', 4500, 18),
  ('Thé vert menthe', 'Boîte de 20 sachets.', 'Épicerie', 2000, 22),
  ('Miel de fleurs 500 g', 'Récolté par un apiculteur de la région.', 'Épicerie', 5000, 12),
  ('Confiture de fraises', 'Pot de 370 g, 60 % de fruits.', 'Épicerie', 2500, 15),
  ('Jus d''orange pressé 1 L', 'Sans sucres ajoutés.', 'Boissons', 2000, 20),
  ('Œufs fermiers (x6)', 'Poules élevées en plein air.', 'Produits frais', 1200, 30),
  ('Fromage de chèvre', 'Bûche affinée, 180 g.', 'Produits frais', 3500, 14),
  ('Tablette chocolat noir 70 %', 'Cacao équitable, 100 g.', 'Épicerie', 1800, 35),
  ('Huile d''olive 50 cl', 'Vierge extra, première pression à froid.', 'Épicerie', 7500, 10)
) as item (name, description, category, price_cents, stock)
join categories on categories.name = item.category;

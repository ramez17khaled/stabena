-- ============================================
-- STABENA - Supabase Schema
-- Copiez-collez ce code dans Supabase > SQL Editor
-- ============================================

-- 1. TABLE PROFILES (utilisateurs)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  address text,
  phone text,
  lang text default 'fr',
  welcome_sent boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trigger auto-création du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. TABLE CATEGORIES
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TABLE PRODUITS
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price decimal(10,2) not null,
  compare_price decimal(10,2),
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. TABLE PRODUIT-CATÉGORIES (many-to-many)
create table public.product_categories (
  product_id uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- 5. TABLE COMMANDES
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  shipping_address jsonb not null,
  payment_status text default 'unpaid' check (payment_status in ('unpaid', 'pending_payment', 'paid', 'refunded')),
  payment_method text default 'cash',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. TABLE LIGNES DE COMMANDE
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price decimal(10,2) not null,
  size text,
  color text
);

-- 7. TABLE PANIER
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer default 1,
  size text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id, size, color)
);

-- 8. TABLE FAVORIS
create table public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id)
);

-- 9. TABLE AVIS
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (product_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;

-- Profiles: chaque user voit son profil, ne peut pas changer son rôle
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND role = (select role from public.profiles where id = auth.uid())
  );

create policy "Admin full access profiles" on public.profiles
  for all using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Produits: lecture publique, écriture admin seulement
create policy "Products are public" on public.products for select using (true);
create policy "Admin manage products" on public.products for all using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Catégories: lecture publique
create policy "Categories are public" on public.categories for select using (true);
create policy "Admin manage categories" on public.categories for all using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Product-categories: lecture publique
create policy "Product categories are public" on public.product_categories for select using (true);
create policy "Admin manage product categories" on public.product_categories for all using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Commandes: user voit ses commandes, admin voit tout
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admin manage orders" on public.orders for all using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Order items
create policy "Users view own order items" on public.order_items for select using (
  exists(select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Users create order items" on public.order_items for insert with check (
  exists(select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admin manage order items" on public.order_items for all using (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Panier: chaque user gère son panier
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- Wishlist
create policy "Users manage own wishlist" on public.wishlist for all using (auth.uid() = user_id);

-- Avis: lecture publique, écriture pour acheteurs uniquement
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Users can write own reviews" on public.reviews for insert
  with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update
  using (auth.uid() = user_id);

-- ============================================
-- DONNÉES DE TEST
-- ============================================

insert into public.categories (name, slug, description) values
  ('Femme', 'femme', 'Collection femme'),
  ('Homme', 'homme', 'Collection homme'),
  ('Accessoires', 'accessoires', 'Sacs, bijoux, ceintures');

insert into public.products (name, slug, description, price, compare_price, stock, is_featured, sizes, colors, images) values
  ('Robe Midi Fleurie', 'robe-midi-fleurie', 'Robe élégante à motifs floraux, parfaite pour toutes occasions.', 59.99, 89.99, 25, true, ARRAY['XS','S','M','L','XL'], ARRAY['Blanc','Rose','Bleu'], ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600']),
  ('Jean Slim Homme', 'jean-slim-homme', 'Jean slim coupe moderne, confortable et stylé.', 49.99, null, 40, true, ARRAY['30','32','34','36','38'], ARRAY['Bleu','Noir','Gris'], ARRAY['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600']),
  ('Blazer Oversize', 'blazer-oversize', 'Blazer tendance coupe oversize, idéal pour un look business casual.', 89.99, 120.00, 15, true, ARRAY['XS','S','M','L'], ARRAY['Beige','Noir','Camel'], ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600']),
  ('Sac Cabas Cuir', 'sac-cabas-cuir', 'Grand sac cabas en cuir véritable, pratique et tendance.', 129.99, null, 10, false, ARRAY[]::text[], ARRAY['Marron','Noir','Crème'], ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600']);

-- ============================================
-- MIGRATIONS ANNIVERSAIRE
-- Exécuter ces commandes dans Supabase SQL Editor
-- ============================================

-- Ajouter les colonnes anniversaire au profil
alter table public.profiles
  add column if not exists birthdate date,
  add column if not exists birthday_coupon_year integer,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists country text;

-- Table des codes de réduction
create table if not exists public.discount_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  user_id uuid references public.profiles(id) on delete cascade,
  discount_percent integer not null,
  min_order_amount decimal(10,2) default 80.00,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.discount_codes enable row level security;

create policy "Users can view own discount codes" on public.discount_codes
  for select using (auth.uid() = user_id);

-- Fonction Postgres pour trouver les anniversaires du jour
create or replace function get_birthday_users(p_month int, p_day int)
returns table (
  id uuid, email text, full_name text, first_name text,
  lang text, birthdate date, birthday_coupon_year integer
) as $$
  select
    p.id, p.email, p.full_name, p.first_name,
    p.lang, p.birthdate, p.birthday_coupon_year
  from public.profiles p
  where
    p.birthdate is not null
    and extract(month from p.birthdate) = p_month
    and extract(day from p.birthdate) = p_day
    and (p.birthday_coupon_year is null or p.birthday_coupon_year < extract(year from current_date)::integer);
$$ language sql security definer;

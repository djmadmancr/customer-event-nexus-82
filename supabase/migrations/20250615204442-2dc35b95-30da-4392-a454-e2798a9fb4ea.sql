
-- Crear tabla para rastrear suscripciones de usuarios
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Usamos TEXT para compatibilidad con el sistema actual
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'inactive', -- active, grace, suspended, inactive
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean solo su información
CREATE POLICY "Users can view own subscription" ON public.subscribers
FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR email = current_setting('request.jwt.claims', true)::json->>'email');

-- Política para que edge functions puedan actualizar (usando service role)
CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
FOR ALL USING (true);

-- Crear índices para optimización
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);

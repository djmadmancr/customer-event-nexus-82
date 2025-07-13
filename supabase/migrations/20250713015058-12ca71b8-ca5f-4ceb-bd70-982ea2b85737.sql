
-- Crear enum para status de eventos
CREATE TYPE event_status AS ENUM ('prospect', 'confirmed', 'finished', 'cancelled');

-- Crear tabla customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status event_status NOT NULL DEFAULT 'prospect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla proposals (formulario público)
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customers
CREATE POLICY "Users can manage their own customers" ON public.customers
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para events
CREATE POLICY "Users can manage their own events" ON public.events
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para payments (a través de events)
CREATE POLICY "Users can manage payments for their events" ON public.payments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = payments.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Políticas RLS para proposals
CREATE POLICY "Users can view their own proposals" ON public.proposals
FOR SELECT USING (auth.uid() = user_id);

-- Política para insertar proposals públicamente (sin autenticación)
CREATE POLICY "Anyone can insert proposals" ON public.proposals
FOR INSERT WITH CHECK (true);

-- Índices para optimización
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_customer_id ON public.events(customer_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_payments_event_id ON public.payments(event_id);
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_created_at ON public.proposals(created_at);

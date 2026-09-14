/**
 * Static Links Database Migration
 * المرحلة: إضافة جدول الروابط الثابتة (static_links)
 * 
 * هذا الملف للتوثيق وللتنفيذ في Supabase لاحقاً عند طلب المستخدم.
 */

/*
CREATE TABLE IF NOT EXISTS public.static_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_static_links_order ON public.static_links(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_static_links_active ON public.static_links(is_active);

ALTER TABLE public.static_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active static_links" ON public.static_links;
CREATE POLICY "Allow public read active static_links"
ON public.static_links
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage static_links" ON public.static_links;
CREATE POLICY "Allow authenticated manage static_links"
ON public.static_links
FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Realtime
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.static_links;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;
*/

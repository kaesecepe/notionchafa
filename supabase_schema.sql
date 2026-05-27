-- 🌸 COZY ACADEMIC DASHBOARD - SUPABASE SQL SCHEMA 🌸
-- Copy and paste this script directly into your Supabase SQL Editor to set up the database.

-- 1. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT NOT NULL,          -- e.g., 'pink', 'peach', 'yellow', 'mint', 'lavender', 'purple', 'gray'
    day_of_week INT NOT NULL,     -- 1 (Monday) to 7 (Sunday)
    time_start TEXT NOT NULL,     -- e.g., '07:30'
    time_end TEXT NOT NULL,       -- e.g., '09:00'
    professor TEXT,
    classroom TEXT,
    notes TEXT,                   -- Text field to hold course notes/reminders
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- Cascades delete if course is removed
    title TEXT NOT NULL,
    due_date DATE NOT NULL,       -- e.g., '2026-05-25'
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Policies (Allows the 'anon' key to read and write without authentication)
-- (Perfect for personal single-user projects where you access it via static deployment or phone)

-- Courses Policies
CREATE POLICY "Allow public select on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on courses" ON public.courses FOR DELETE USING (true);

-- Tasks Policies
CREATE POLICY "Allow public select on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tasks" ON public.tasks FOR DELETE USING (true);

-- 5. Seed some initial cozy mock data (Optional, you can comment this out or run it to pre-populate your online DB)
-- INSERT INTO public.courses (name, code, color, day_of_week, time_start, time_end, professor, classroom, notes) VALUES
-- ('Desarrollo Web', 'WEB-301', 'mint', 3, '09:30', '11:00', 'Prof. Ana Flores', 'Lab 4', 'Aprender React y Supabase. Proyecto final vale 40%.'),
-- ('Cálculo Diferencial', 'MAT-102', 'pink', 1, '07:30', '09:00', 'Prof. Carlos Ruíz', 'Aula B2', 'Estudiar para el examen de límites y derivadas continuas.'),
-- ('Diseño UI/UX', 'UIX-204', 'lavender', 5, '11:30', '13:00', 'Prof. Sofia Reyes', 'Aula C1', 'Figma Notion redesign project due in 2 weeks.');

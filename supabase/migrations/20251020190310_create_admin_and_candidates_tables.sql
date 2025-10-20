/*
  # Create Admin and Candidate Performance Tables

  ## Overview
  This migration creates the database schema for the admin dashboard to track and analyze all candidate data and performance metrics.

  ## New Tables

  ### 1. `candidates`
  Stores all registered candidate information
  - `id` (uuid, primary key) - Unique candidate identifier
  - `name` (text) - Candidate full name
  - `email` (text, unique) - Candidate email address
  - `phone` (text) - Contact phone number
  - `experience_level` (text) - Experience level: 'fresher', '1-3', '3+'
  - `preferred_role` (text) - Preferred job role
  - `registration_date` (timestamptz) - When candidate registered
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `assessment_attempts`
  Tracks all assessment attempts by candidates
  - `id` (uuid, primary key) - Unique attempt identifier
  - `candidate_id` (uuid, foreign key) - References candidates table
  - `assessment_type` (text) - Type: 'dsa', 'aptitude', 'interview'
  - `score` (numeric) - Score achieved
  - `total_questions` (integer) - Total questions in assessment
  - `time_spent` (integer) - Time spent in seconds
  - `completed` (boolean) - Whether assessment was completed
  - `attempt_date` (timestamptz) - When attempt was made
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `performance_metrics`
  Stores detailed performance analytics for each candidate
  - `id` (uuid, primary key) - Unique metric identifier
  - `candidate_id` (uuid, foreign key) - References candidates table
  - `overall_score` (numeric) - Overall performance score
  - `percentile` (numeric) - Percentile rank among all candidates
  - `dsa_score` (numeric) - DSA assessment score
  - `aptitude_score` (numeric) - Aptitude assessment score
  - `interview_score` (numeric) - Interview assessment score
  - `strengths` (text[]) - Array of strength areas
  - `weaknesses` (text[]) - Array of weakness areas
  - `last_updated` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `admins`
  Stores admin user credentials and access levels
  - `id` (uuid, primary key) - Unique admin identifier
  - `email` (text, unique) - Admin email address
  - `password_hash` (text) - Hashed password
  - `name` (text) - Admin full name
  - `role` (text) - Admin role: 'super_admin', 'admin'
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security on all tables
  - Add policies for admin access to view all candidate data
  - Add policies for candidates to view only their own data
  - Restrict write access appropriately

  ## Indexes
  - Add indexes on foreign keys for better query performance
  - Add indexes on commonly queried fields (email, assessment_type, etc.)
*/

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  experience_level text NOT NULL CHECK (experience_level IN ('fresher', '1-3', '3+')),
  preferred_role text NOT NULL,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create assessment_attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  assessment_type text NOT NULL CHECK (assessment_type IN ('dsa', 'aptitude', 'interview')),
  score numeric NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_spent integer NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  attempt_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  overall_score numeric DEFAULT 0,
  percentile numeric DEFAULT 0,
  dsa_score numeric DEFAULT 0,
  aptitude_score numeric DEFAULT 0,
  interview_score numeric DEFAULT 0,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id)
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_candidate_id ON assessment_attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_type ON assessment_attempts(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_date ON assessment_attempts(attempt_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_candidate_id ON performance_metrics(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates table
CREATE POLICY "Admins can view all candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Candidates can view own profile"
  ON candidates FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert candidates"
  ON candidates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Candidates can update own profile"
  ON candidates FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for assessment_attempts table
CREATE POLICY "Admins can view all assessment attempts"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Candidates can view own attempts"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates WHERE candidates.id = candidate_id AND candidates.id = auth.uid()
    )
  );

CREATE POLICY "Candidates can insert own attempts"
  ON assessment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates WHERE candidates.id = candidate_id AND candidates.id = auth.uid()
    )
  );

CREATE POLICY "Candidates can update own attempts"
  ON assessment_attempts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates WHERE candidates.id = candidate_id AND candidates.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates WHERE candidates.id = candidate_id AND candidates.id = auth.uid()
    )
  );

-- RLS Policies for performance_metrics table
CREATE POLICY "Admins can view all performance metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Candidates can view own metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidates WHERE candidates.id = candidate_id AND candidates.id = auth.uid()
    )
  );

CREATE POLICY "System can insert performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update performance metrics"
  ON performance_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for admins table
CREATE POLICY "Admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND role = 'super_admin'
    )
  );
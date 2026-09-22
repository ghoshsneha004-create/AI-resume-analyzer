export interface SectionScore {
  name: string;
  score: number;
  max_score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'missing';
  feedback: string;
}

export interface BulletRewrite {
  original: string;
  improved: string;
  rationale: string;
  impact_metric?: string;
}

export interface ActionVerbSuggestion {
  original_phrase: string;
  suggested_verb: string;
  example: string;
}

export interface GrammarIssue {
  issue: string;
  context: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ComparisonSection {
  section_name: string;
  original: string;
  improved: string;
  highlights: string[];
}

export interface AnalysisData {
  id: string;
  resume_id: string;
  overall_score: number;
  ats_score: number;
  section_scores: Record<string, SectionScore>;
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  missing_skills: string[];
  recommended_skills: {
    technical?: string[];
    soft?: string[];
  };
  grammar_issues: GrammarIssue[];
  action_verb_suggestions: ActionVerbSuggestion[];
  rewritten_bullets: BulletRewrite[];
  improved_summary?: string;
  ats_optimizations: string[];
  comparison_data: ComparisonSection[];
  pdf_report_path?: string;
  created_at: string;
}

export interface ResumeData {
  id: string;
  user_id?: string;
  filename: string;
  target_role?: string;
  file_size: number;
  file_type: string;
  created_at: string;
  raw_text?: string;
  parsed_data?: {
    word_count?: number;
    contact_info?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      github?: string;
      location?: string;
    };
    sections?: Record<string, string>;
    extracted_bullets?: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

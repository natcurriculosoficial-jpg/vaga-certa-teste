export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_vagacerta_userroles: {
        Row: {
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_credit_purchases: {
        Row: {
          created_at: string | null
          credits_amount: number
          id: string
          payment_id: string | null
          price_cents: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_amount: number
          id?: string
          payment_id?: string | null
          price_cents: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_amount?: number
          id?: string
          payment_id?: string | null
          price_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_credit_purchases_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payment_history"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_credits: {
        Row: {
          bonus_credits: number
          id: string
          plan_credits_remaining: number
          plan_credits_reset_at: string | null
          plan_credits_total: number
          trial_credits_remaining: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_credits?: number
          id?: string
          plan_credits_remaining?: number
          plan_credits_reset_at?: string | null
          plan_credits_total?: number
          trial_credits_remaining?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_credits?: number
          id?: string
          plan_credits_remaining?: number
          plan_credits_reset_at?: string | null
          plan_credits_total?: number
          trial_credits_remaining?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asaas_pending_charges: {
        Row: {
          billing_cycle: string | null
          created_at: string
          credits: number | null
          payment_id: string
          plan_id: string | null
          plan_slug: string | null
          price_cents: number | null
          type: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          credits?: number | null
          payment_id: string
          plan_id?: string | null
          plan_slug?: string | null
          price_cents?: number | null
          type: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          credits?: number | null
          payment_id?: string
          plan_id?: string | null
          plan_slug?: string | null
          price_cents?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          id: string
          institution: string
          name: string
          sort_order: number
          user_id: string
          year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          institution?: string
          name: string
          sort_order?: number
          user_id: string
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institution?: string
          name?: string
          sort_order?: number
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      checklist_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          item_key: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          item_key: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          item_key?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          parent_id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_favorites: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_favorites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          favorites_count: number | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          likes_count: number | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          favorites_count?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          favorites_count?: number | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          emoji: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          emoji?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          emoji?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          published: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          course: string
          created_at: string
          description: string | null
          id: string
          institution: string
          period: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          course?: string
          created_at?: string
          description?: string | null
          id?: string
          institution?: string
          period?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          course?: string
          created_at?: string
          description?: string | null
          id?: string
          institution?: string
          period?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          sent_at: string
          template: string
          user_id: string
        }
        Insert: {
          sent_at?: string
          template: string
          user_id: string
        }
        Update: {
          sent_at?: string
          template?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string | null
          created_at: string | null
          description: string | null
          id: string
          period: string | null
          role: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          period?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          period?: string | null
          role?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          count: number
          feature_key: string
          id: string
          last_used_at: string | null
          period: string
          user_id: string
        }
        Insert: {
          count?: number
          feature_key: string
          id?: string
          last_used_at?: string | null
          period: string
          user_id: string
        }
        Update: {
          count?: number
          feature_key?: string
          id?: string
          last_used_at?: string | null
          period?: string
          user_id?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          id: string
          language: string
          level: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          level?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          level?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          id: string
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          description: string | null
          external_payment_id: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_provider: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          status: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          ai_credits_monthly: number | null
          created_at: string | null
          description: string | null
          has_advanced_filters: boolean | null
          has_all_courses: boolean | null
          has_benchmark: boolean | null
          has_community_read: boolean | null
          has_community_write: boolean | null
          has_docx_export: boolean | null
          has_interview: boolean | null
          has_job_tracker: boolean | null
          has_priority_support: boolean | null
          has_score: boolean | null
          has_watermark_free: boolean | null
          id: string
          interview_monthly_limit: number | null
          interview_sessions_monthly: number | null
          is_active: boolean | null
          job_search_daily: number | null
          job_search_results: number | null
          job_tracker_limit: number | null
          name: string
          pix_price_monthly_cents: number | null
          pix_price_yearly_cents: number | null
          price_annual: number | null
          price_monthly: number | null
          price_monthly_cents: number
          price_yearly_cents: number
          slug: string
          sort_order: number | null
          stripe_price_monthly: string | null
          stripe_price_yearly: string | null
          tagline: string | null
        }
        Insert: {
          ai_credits_monthly?: number | null
          created_at?: string | null
          description?: string | null
          has_advanced_filters?: boolean | null
          has_all_courses?: boolean | null
          has_benchmark?: boolean | null
          has_community_read?: boolean | null
          has_community_write?: boolean | null
          has_docx_export?: boolean | null
          has_interview?: boolean | null
          has_job_tracker?: boolean | null
          has_priority_support?: boolean | null
          has_score?: boolean | null
          has_watermark_free?: boolean | null
          id?: string
          interview_monthly_limit?: number | null
          interview_sessions_monthly?: number | null
          is_active?: boolean | null
          job_search_daily?: number | null
          job_search_results?: number | null
          job_tracker_limit?: number | null
          name: string
          pix_price_monthly_cents?: number | null
          pix_price_yearly_cents?: number | null
          price_annual?: number | null
          price_monthly?: number | null
          price_monthly_cents: number
          price_yearly_cents: number
          slug: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_yearly?: string | null
          tagline?: string | null
        }
        Update: {
          ai_credits_monthly?: number | null
          created_at?: string | null
          description?: string | null
          has_advanced_filters?: boolean | null
          has_all_courses?: boolean | null
          has_benchmark?: boolean | null
          has_community_read?: boolean | null
          has_community_write?: boolean | null
          has_docx_export?: boolean | null
          has_interview?: boolean | null
          has_job_tracker?: boolean | null
          has_priority_support?: boolean | null
          has_score?: boolean | null
          has_watermark_free?: boolean | null
          id?: string
          interview_monthly_limit?: number | null
          interview_sessions_monthly?: number | null
          is_active?: boolean | null
          job_search_daily?: number | null
          job_search_results?: number | null
          job_tracker_limit?: number | null
          name?: string
          pix_price_monthly_cents?: number | null
          pix_price_yearly_cents?: number | null
          price_annual?: number | null
          price_monthly?: number | null
          price_monthly_cents?: number
          price_yearly_cents?: number
          slug?: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_yearly?: string | null
          tagline?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
          avatar_url: string | null
          city: string | null
          cpf: string | null
          created_at: string | null
          current_plan: string | null
          email: string | null
          id: string
          instagram_url: string | null
          level: string | null
          linkedin_sections: Json | null
          linkedin_url: string | null
          name: string | null
          objective: string | null
          onboarding_complete: boolean | null
          phone: string | null
          portfolio_url: string | null
          situation: string | null
          target_role: string | null
          trial_used: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area?: string | null
          avatar_url?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          current_plan?: string | null
          email?: string | null
          id: string
          instagram_url?: string | null
          level?: string | null
          linkedin_sections?: Json | null
          linkedin_url?: string | null
          name?: string | null
          objective?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          situation?: string | null
          target_role?: string | null
          trial_used?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area?: string | null
          avatar_url?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          current_plan?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          level?: string | null
          linkedin_sections?: Json | null
          linkedin_url?: string | null
          name?: string | null
          objective?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          portfolio_url?: string | null
          situation?: string | null
          target_role?: string | null
          trial_used?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          id: string
          payment_provider: string | null
          plan_id: string
          status: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          plan_id: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          plan_id?: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      table_vagacerta_courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      table_vagacerta_lessons: {
        Row: {
          id: string
          module_id: string
          order: number | null
          title: string | null
          video_url: string | null
        }
        Insert: {
          id?: string
          module_id: string
          order?: number | null
          title?: string | null
          video_url?: string | null
        }
        Update: {
          id?: string
          module_id?: string
          order?: number | null
          title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      table_vagacerta_modules: {
        Row: {
          course_id: string
          id: string
          order: number | null
          title: string | null
        }
        Insert: {
          course_id: string
          id?: string
          order?: number | null
          title?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          order?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_vagacerta_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "table_vagacerta_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          module: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          module: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          module?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_roles: {
        Row: {
          id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_feature_access: {
        Args: { p_feature: string; p_user_id: string }
        Returns: Json
      }
      expire_trials: { Args: never; Returns: undefined }
      get_gemini_key: { Args: never; Returns: string }
      get_user_plan: { Args: { p_user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      recharge_credits: {
        Args: {
          p_credits: number
          p_payment_id?: string
          p_price_cents: number
          p_user_id: string
        }
        Returns: Json
      }
      register_interview_session: { Args: never; Returns: undefined }
      renew_monthly_credits: { Args: never; Returns: undefined }
      use_ai_credit: {
        Args: { p_amount?: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

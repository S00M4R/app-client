export type ReportStatus =
  | 'open'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface ReportCategory {
  id: string;
  label: string;
  description: string | null;
  icon: string;
  color: string;
  severity_default: number;
  is_active: boolean;
  sort_order: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  category_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address_label: string | null;
  severity: number;
  status: ReportStatus;
  photo_urls: string[];
  upvote_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ReportNearby extends Report {
  distance_meters: number;
}

export interface ReportComment {
  id: string;
  report_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ReportCluster {
  cluster_lat: number;
  cluster_lng: number;
  report_count: number;
  category_ids: string[];
}

// Minimal typed surface for the Supabase client / RPC calls used in-app.
export interface Database {
  public: {
    Tables: {
      reports: {
        Row: Report;
        Insert: Partial<Report> &
          Pick<Report, 'category_id' | 'title' | 'latitude' | 'longitude'>;
        Update: Partial<Report>;
      };
      report_categories: {
        Row: ReportCategory;
        Insert: ReportCategory;
        Update: Partial<ReportCategory>;
      };
      report_votes: {
        Row: { report_id: string; user_id: string; created_at: string };
        Insert: { report_id: string; user_id: string };
        Update: never;
      };
      report_comments: {
        Row: ReportComment;
        Insert: Pick<ReportComment, 'report_id' | 'body'>;
        Update: never;
      };
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
      };
    };
    Functions: {
      reports_in_bounds: {
        Args: {
          min_lat: number;
          min_lng: number;
          max_lat: number;
          max_lng: number;
          category_filter: string[] | null;
          status_filter: ReportStatus[] | null;
        };
        Returns: Report[];
      };
      reports_nearby: {
        Args: {
          center_lat: number;
          center_lng: number;
          radius_meters: number;
          category_filter: string[] | null;
        };
        Returns: ReportNearby[];
      };
      reports_clustered: {
        Args: {
          min_lat: number;
          min_lng: number;
          max_lat: number;
          max_lng: number;
          precision_deg: number;
          category_filter: string[] | null;
        };
        Returns: ReportCluster[];
      };
      toggle_report_vote: {
        Args: { p_report_id: string };
        Returns: boolean;
      };
    };
  };
}

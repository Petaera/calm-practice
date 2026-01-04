export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      modules: {
        Row: {
          id: string
          therapist_id: string
          name: string
          description: string | null
          color: string | null
          display_order: number
          is_active: boolean
          share_token: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          name: string
          description?: string | null
          color?: string | null
          display_order?: number
          is_active?: boolean
          share_token?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          name?: string
          description?: string | null
          color?: string | null
          display_order?: number
          is_active?: boolean
          share_token?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          id: string
          therapist_id: string
          module_id: string | null
          resource_type: string
          title: string
          description: string | null
          file_url: string | null
          external_url: string | null
          content: string | null
          metadata: Json
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          module_id?: string | null
          resource_type: string
          title: string
          description?: string | null
          file_url?: string | null
          external_url?: string | null
          content?: string | null
          metadata?: Json
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          module_id?: string | null
          resource_type?: string
          title?: string
          description?: string | null
          file_url?: string | null
          external_url?: string | null
          content?: string | null
          metadata?: Json
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
      }
      module_client_assignments: {
        Row: {
          id: string
          module_id: string
          client_id: string
          therapist_id: string
          assigned_at: string
          accessed_at: string | null
          completed_at: string | null
          is_active: boolean
          therapist_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          client_id: string
          therapist_id: string
          assigned_at?: string
          accessed_at?: string | null
          completed_at?: string | null
          is_active?: boolean
          therapist_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          client_id?: string
          therapist_id?: string
          assigned_at?: string
          accessed_at?: string | null
          completed_at?: string | null
          is_active?: boolean
          therapist_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_client_assignments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_client_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
      },
      resource_client_assignments: {
        Row: {
          id: string
          resource_id: string
          client_id: string
          therapist_id: string
          assigned_at: string
          accessed_at: string | null
          completed_at: string | null
          is_active: boolean
          therapist_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          client_id: string
          therapist_id: string
          assigned_at?: string
          accessed_at?: string | null
          completed_at?: string | null
          is_active?: boolean
          therapist_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          client_id?: string
          therapist_id?: string
          assigned_at?: string
          accessed_at?: string | null
          completed_at?: string | null
          is_active?: boolean
          therapist_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_client_assignments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_client_assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          }
        ]
      },
      module_resources: {
        Row: {
          id: string
          module_id: string
          resource_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          resource_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          resource_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          }
        ]
      },
      activity_feed: {
        Row: {
          activity_type: string;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_important: boolean | null;
          is_read: boolean | null;
          read_at: string | null;
          related_entity_id: string | null;
          related_entity_type: string | null;
          therapist_id: string;
          title: string;
        };
        Insert: {
          activity_type: string;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_important?: boolean | null;
          is_read?: boolean | null;
          read_at?: string | null;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          therapist_id: string;
          title: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_important?: boolean | null;
          is_read?: boolean | null;
          read_at?: string | null;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          therapist_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_feed_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          appointment_date: string;
          appointment_type: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          client_id: string | null;
          created_at: string | null;
          duration_minutes: number;
          end_time: string;
          id: string;
          location: string | null;
          meeting_link: string | null;
          mode: string | null;
          notes: string | null;
          reminder_sent: boolean | null;
          reminder_sent_at: string | null;
          session_id: string | null;
          start_time: string;
          status: string | null;
          therapist_id: string;
          updated_at: string | null;
        };
        Insert: {
          appointment_date: string;
          appointment_type?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          duration_minutes: number;
          end_time: string;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          mode?: string | null;
          notes?: string | null;
          reminder_sent?: boolean | null;
          reminder_sent_at?: string | null;
          session_id?: string | null;
          start_time: string;
          status?: string | null;
          therapist_id: string;
          updated_at?: string | null;
        };
        Update: {
          appointment_date?: string;
          appointment_type?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_id?: string | null;
          created_at?: string | null;
          duration_minutes?: number;
          end_time?: string;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          mode?: string | null;
          notes?: string | null;
          reminder_sent?: boolean | null;
          reminder_sent_at?: string | null;
          session_id?: string | null;
          start_time?: string;
          status?: string | null;
          therapist_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      assessments: {
        Row: {
          allow_multiple_submissions: boolean | null;
          category: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          share_token: string | null;
          show_scores_to_client: boolean | null;
          therapist_id: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          allow_multiple_submissions?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          share_token?: string | null;
          show_scores_to_client?: boolean | null;
          therapist_id: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          allow_multiple_submissions?: boolean | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          share_token?: string | null;
          show_scores_to_client?: boolean | null;
          therapist_id?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      questions: {
        Row: {
          id: string;
          therapist_id: string | null;
          question_text: string;
          question_type: string;
          options: Json | null;
          validation_rules: Json | null;
          placeholder_text: string | null;
          help_text: string | null;
          is_global: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          therapist_id?: string | null;
          question_text: string;
          question_type: string;
          options?: Json | null;
          validation_rules?: Json | null;
          placeholder_text?: string | null;
          help_text?: string | null;
          is_global?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          therapist_id?: string | null;
          question_text?: string;
          question_type?: string;
          options?: Json | null;
          validation_rules?: Json | null;
          placeholder_text?: string | null;
          help_text?: string | null;
          is_global?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "questions_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string;
          question_id: string;
          question_order: number;
          is_required: boolean | null;
          points: number | null;
          override_question_text: string | null;
          override_options: Json | null;
          override_help_text: string | null;
          section_name: string | null;
          conditional_logic: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_id: string;
          question_order: number;
          is_required?: boolean | null;
          points?: number | null;
          override_question_text?: string | null;
          override_options?: Json | null;
          override_help_text?: string | null;
          section_name?: string | null;
          conditional_logic?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_id?: string;
          question_order?: number;
          is_required?: boolean | null;
          points?: number | null;
          override_question_text?: string | null;
          override_options?: Json | null;
          override_help_text?: string | null;
          section_name?: string | null;
          conditional_logic?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_questions_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      assessment_submissions: {
        Row: {
          id: string;
          assessment_id: string;
          client_id: string;
          therapist_id: string;
          session_id: string | null;
          submitted_at: string | null;
          completion_time_seconds: number | null;
          raw_score: number | null;
          calculated_score: number | null;
          score_interpretation: string | null;
          notes: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          client_id: string;
          therapist_id: string;
          session_id?: string | null;
          submitted_at?: string | null;
          completion_time_seconds?: number | null;
          raw_score?: number | null;
          calculated_score?: number | null;
          score_interpretation?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          client_id?: string;
          therapist_id?: string;
          session_id?: string | null;
          submitted_at?: string | null;
          completion_time_seconds?: number | null;
          raw_score?: number | null;
          calculated_score?: number | null;
          score_interpretation?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_submissions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_submissions_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_submissions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      assessment_responses: {
        Row: {
          id: string;
          submission_id: string;
          assessment_question_id: string;
          question_id: string;
          response_value: string | null;
          response_values: string[] | null;
          numeric_value: number | null;
          points_earned: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          submission_id: string;
          assessment_question_id: string;
          question_id: string;
          response_value?: string | null;
          response_values?: string[] | null;
          numeric_value?: number | null;
          points_earned?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          submission_id?: string;
          assessment_question_id?: string;
          question_id?: string;
          response_value?: string | null;
          response_values?: string[] | null;
          numeric_value?: number | null;
          points_earned?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_responses_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "assessment_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_responses_assessment_question_id_fkey";
            columns: ["assessment_question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_responses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      assessment_assignments: {
        Row: {
          id: string;
          assessment_id: string;
          client_id: string;
          therapist_id: string;
          assigned_at: string | null;
          due_date: string | null;
          completed_at: string | null;
          submission_id: string | null;
          status: string | null;
          reminder_sent: boolean | null;
          reminder_sent_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          client_id: string;
          therapist_id: string;
          assigned_at?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          submission_id?: string | null;
          status?: string | null;
          reminder_sent?: boolean | null;
          reminder_sent_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          client_id?: string;
          therapist_id?: string;
          assigned_at?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          submission_id?: string | null;
          status?: string | null;
          reminder_sent?: boolean | null;
          reminder_sent_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_assignments_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_assignments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_assignments_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_assignments_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "assessment_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          address: string | null;
          age: number | null;
          client_id: string;
          concerns: string[] | null;
          created_at: string | null;
          date_of_birth: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relationship: string | null;
          full_name: string;
          gender: string | null;
          id: string;
          intake_date: string | null;
          intake_notes: string | null;
          phone: string | null;
          status: string | null;
          therapist_id: string;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          age?: number | null;
          client_id: string;
          concerns?: string[] | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          full_name: string;
          gender?: string | null;
          id?: string;
          intake_date?: string | null;
          intake_notes?: string | null;
          phone?: string | null;
          status?: string | null;
          therapist_id: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          age?: number | null;
          client_id?: string;
          concerns?: string[] | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          full_name?: string;
          gender?: string | null;
          id?: string;
          intake_date?: string | null;
          intake_notes?: string | null;
          phone?: string | null;
          status?: string | null;
          therapist_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          client_id: string | null;
          content: string;
          created_at: string | null;
          id: string;
          is_archived: boolean | null;
          is_important: boolean | null;
          note_type: string | null;
          session_id: string | null;
          tags: string[] | null;
          therapist_id: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          client_id?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_important?: boolean | null;
          note_type?: string | null;
          session_id?: string | null;
          tags?: string[] | null;
          therapist_id: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          client_id?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_important?: boolean | null;
          note_type?: string | null;
          session_id?: string | null;
          tags?: string[] | null;
          therapist_id?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      soap_notes: {
        Row: {
          id: string;
          therapist_id: string;
          client_id: string;
          assessment_submission_id: string | null;
          title: string;
          subjective: Json;
          objective: Json;
          assessment: Json;
          plan: Json;
          tags: string[] | null;
          is_important: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          client_id: string;
          assessment_submission_id?: string | null;
          title: string;
          subjective?: Json;
          objective?: Json;
          assessment?: Json;
          plan?: Json;
          tags?: string[] | null;
          is_important?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          client_id?: string;
          assessment_submission_id?: string | null;
          title?: string;
          subjective?: Json;
          objective?: Json;
          assessment?: Json;
          plan?: Json;
          tags?: string[] | null;
          is_important?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "soap_notes_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "soap_notes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "soap_notes_assessment_submission_id_fkey";
            columns: ["assessment_submission_id"];
            isOneToOne: false;
            referencedRelation: "assessment_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          client_id: string;
          created_at: string | null;
          duration_minutes: number | null;
          id: string;
          location: string | null;
          meeting_link: string | null;
          payment_amount: number | null;
          payment_status: string | null;
          session_date: string;
          session_id: string;
          session_notes: string | null;
          session_purpose: string | null;
          session_time: string;
          session_type: string | null;
          status: string | null;
          therapist_id: string;
          updated_at: string | null;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          payment_amount?: number | null;
          payment_status?: string | null;
          session_date: string;
          session_id: string;
          session_notes?: string | null;
          session_purpose?: string | null;
          session_time: string;
          session_type?: string | null;
          status?: string | null;
          therapist_id: string;
          updated_at?: string | null;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: string;
          location?: string | null;
          meeting_link?: string | null;
          payment_amount?: number | null;
          payment_status?: string | null;
          session_date?: string;
          session_id?: string;
          session_notes?: string | null;
          session_purpose?: string | null;
          session_time?: string;
          session_type?: string | null;
          status?: string | null;
          therapist_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          category: string | null;
          client_id: string | null;
          completed_at: string | null;
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          due_time: string | null;
          id: string;
          is_recurring: boolean | null;
          priority: string | null;
          recurrence_pattern: Json | null;
          reminder_at: string | null;
          session_id: string | null;
          status: string | null;
          therapist_id: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          client_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          id?: string;
          is_recurring?: boolean | null;
          priority?: string | null;
          recurrence_pattern?: Json | null;
          reminder_at?: string | null;
          session_id?: string | null;
          status?: string | null;
          therapist_id: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          client_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          id?: string;
          is_recurring?: boolean | null;
          priority?: string | null;
          recurrence_pattern?: Json | null;
          reminder_at?: string | null;
          session_id?: string | null;
          status?: string | null;
          therapist_id?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      therapists: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string;
          id: string;
          license_number: string | null;
          password_hash: string | null;
          phone: string | null;
          practice_name: string | null;
          specialization: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name: string;
          id?: string;
          license_number?: string | null;
          password_hash?: string | null;
          phone?: string | null;
          practice_name?: string | null;
          specialization?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          license_number?: string | null;
          password_hash?: string | null;
          phone?: string | null;
          practice_name?: string | null;
          specialization?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      specializations: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      therapist_specializations: {
        Row: {
          created_at: string;
          specialization_id: string;
          therapist_id: string;
        };
        Insert: {
          created_at?: string;
          specialization_id: string;
          therapist_id: string;
        };
        Update: {
          created_at?: string;
          specialization_id?: string;
          therapist_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_specializations_specialization_id_fkey";
            columns: ["specialization_id"];
            isOneToOne: false;
            referencedRelation: "specializations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapist_specializations_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      therapist_settings: {
        Row: {
          appointment_reminders: boolean | null;
          auto_logout: boolean | null;
          calendar_view: string | null;
          cancellation_policy: string | null;
          created_at: string | null;
          currency: string | null;
          custom_settings: Json | null;
          dashboard_widgets: Json | null;
          date_format: string | null;
          default_session_duration: number | null;
          default_session_fee: number | null;
          email_notifications: boolean | null;
          id: string;
          language: string | null;
          late_cancellation_hours: number | null;
          payment_reminders: boolean | null;
          reminder_hours_before: number | null;
          require_2fa: boolean | null;
          session_buffer_minutes: number | null;
          session_timeout_minutes: number | null;
          sidebar_collapsed: boolean | null;
          sms_notifications: boolean | null;
          task_due_reminders: boolean | null;
          theme: string | null;
          therapist_id: string;
          time_format: string | null;
          timezone: string | null;
          updated_at: string | null;
          working_hours_end: string | null;
          working_hours_start: string | null;
        };
        Insert: {
          appointment_reminders?: boolean | null;
          auto_logout?: boolean | null;
          calendar_view?: string | null;
          cancellation_policy?: string | null;
          created_at?: string | null;
          currency?: string | null;
          custom_settings?: Json | null;
          dashboard_widgets?: Json | null;
          date_format?: string | null;
          default_session_duration?: number | null;
          default_session_fee?: number | null;
          email_notifications?: boolean | null;
          id?: string;
          language?: string | null;
          late_cancellation_hours?: number | null;
          payment_reminders?: boolean | null;
          reminder_hours_before?: number | null;
          require_2fa?: boolean | null;
          session_buffer_minutes?: number | null;
          session_timeout_minutes?: number | null;
          sidebar_collapsed?: boolean | null;
          sms_notifications?: boolean | null;
          task_due_reminders?: boolean | null;
          theme?: string | null;
          therapist_id: string;
          time_format?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          working_hours_end?: string | null;
          working_hours_start?: string | null;
        };
        Update: {
          appointment_reminders?: boolean | null;
          auto_logout?: boolean | null;
          calendar_view?: string | null;
          cancellation_policy?: string | null;
          created_at?: string | null;
          currency?: string | null;
          custom_settings?: Json | null;
          dashboard_widgets?: Json | null;
          date_format?: string | null;
          default_session_duration?: number | null;
          default_session_fee?: number | null;
          email_notifications?: boolean | null;
          id?: string;
          language?: string | null;
          late_cancellation_hours?: number | null;
          payment_reminders?: boolean | null;
          reminder_hours_before?: number | null;
          require_2fa?: boolean | null;
          session_buffer_minutes?: number | null;
          session_timeout_minutes?: number | null;
          sidebar_collapsed?: boolean | null;
          sms_notifications?: boolean | null;
          task_due_reminders?: boolean | null;
          theme?: string | null;
          therapist_id?: string;
          time_format?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          working_hours_end?: string | null;
          working_hours_start?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_settings_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: true;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          email_sent_at: string | null;
          id: string;
          is_read: boolean | null;
          link_to: string | null;
          message: string;
          notification_type: string;
          priority: string | null;
          read_at: string | null;
          related_id: string | null;
          send_email: boolean | null;
          therapist_id: string;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          email_sent_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          link_to?: string | null;
          message: string;
          notification_type: string;
          priority?: string | null;
          read_at?: string | null;
          related_id?: string | null;
          send_email?: boolean | null;
          therapist_id: string;
          title: string;
        };
        Update: {
          created_at?: string | null;
          email_sent_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          link_to?: string | null;
          message?: string;
          notification_type?: string;
          priority?: string | null;
          read_at?: string | null;
          related_id?: string | null;
          send_email?: boolean | null;
          therapist_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Domain-specific type aliases for convenience
export type Therapist = Tables<"therapists">;
export type TherapistInsert = TablesInsert<"therapists">;
export type TherapistUpdate = TablesUpdate<"therapists">;

export type TherapistSettings = Tables<"therapist_settings">;
export type TherapistSettingsInsert = TablesInsert<"therapist_settings">;
export type TherapistSettingsUpdate = TablesUpdate<"therapist_settings">;

export type Specialization = Tables<"specializations">;
export type SpecializationInsert = TablesInsert<"specializations">;
export type SpecializationUpdate = TablesUpdate<"specializations">;

export type TherapistSpecialization = Tables<"therapist_specializations">;
export type TherapistSpecializationInsert = TablesInsert<"therapist_specializations">;
export type TherapistSpecializationUpdate = TablesUpdate<"therapist_specializations">;

export type Client = Tables<"clients">;
export type ClientInsert = TablesInsert<"clients">;
export type ClientUpdate = TablesUpdate<"clients">;

export type Session = Tables<"sessions">;
export type SessionInsert = TablesInsert<"sessions">;
export type SessionUpdate = TablesUpdate<"sessions">;

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;

export type Note = Tables<"notes">;
export type NoteInsert = TablesInsert<"notes">;
export type NoteUpdate = TablesUpdate<"notes">;
export type SoapNote = Tables<"soap_notes">;
export type SoapNoteInsert = TablesInsert<"soap_notes">;
export type SoapNoteUpdate = TablesUpdate<"soap_notes">;

export type Appointment = Tables<"appointments">;
export type AppointmentInsert = TablesInsert<"appointments">;
export type AppointmentUpdate = TablesUpdate<"appointments">;

export type Assessment = Tables<"assessments">;
export type AssessmentInsert = TablesInsert<"assessments">;
export type AssessmentUpdate = TablesUpdate<"assessments">;

export type Question = Tables<"questions">;
export type QuestionInsert = TablesInsert<"questions">;
export type QuestionUpdate = TablesUpdate<"questions">;

export type AssessmentQuestion = Tables<"assessment_questions">;
export type AssessmentQuestionInsert = TablesInsert<"assessment_questions">;
export type AssessmentQuestionUpdate = TablesUpdate<"assessment_questions">;

export type AssessmentSubmission = Tables<"assessment_submissions">;
export type AssessmentSubmissionInsert = TablesInsert<"assessment_submissions">;
export type AssessmentSubmissionUpdate = TablesUpdate<"assessment_submissions">;

export type AssessmentResponse = Tables<"assessment_responses">;
export type AssessmentResponseInsert = TablesInsert<"assessment_responses">;
export type AssessmentResponseUpdate = TablesUpdate<"assessment_responses">;

export type AssessmentAssignment = Tables<"assessment_assignments">;
export type AssessmentAssignmentInsert = TablesInsert<"assessment_assignments">;
export type AssessmentAssignmentUpdate = TablesUpdate<"assessment_assignments">;

export type TherapistSettings = Tables<"therapist_settings">;
export type TherapistSettingsInsert = TablesInsert<"therapist_settings">;
export type TherapistSettingsUpdate = TablesUpdate<"therapist_settings">;

export type Notification = Tables<"notifications">;
export type NotificationInsert = TablesInsert<"notifications">;
export type NotificationUpdate = TablesUpdate<"notifications">;

export type ActivityFeed = Tables<"activity_feed">;
export type ActivityFeedInsert = TablesInsert<"activity_feed">;
export type ActivityFeedUpdate = TablesUpdate<"activity_feed">;

// Enum types for type safety
export type ClientStatus = "Active" | "On-hold" | "Closed" | "Inactive";
export type SessionStatus = "Scheduled" | "Upcoming" | "Completed" | "Cancelled" | "No-show";
export type SessionType = "In-person" | "Online" | "Phone";
export type PaymentStatus = "Paid" | "Pending" | "Unpaid" | "Insurance";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TaskCategory = "Clinical" | "Admin" | "Assessment" | "Follow-up" | "Documentation" | "Other";
export type NoteType = "general" | "clinical" | "observation" | "resource";
export type AppointmentType = "therapy_session" | "intake" | "assessment" | "consultation" | "follow_up" | "emergency";
export type AppointmentMode = "in-person" | "online" | "phone";
export type AppointmentStatus = "scheduled" | "confirmed" | "rescheduled" | "cancelled" | "no_show" | "completed";
export type NotificationType = "appointment_reminder" | "task_due" | "payment_overdue" | "session_cancelled" | "new_message" | "system" | "custom";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

// Assessment-related enums
export type QuestionType = "multiple_choice" | "yes_no" | "text" | "rating";
export type AssessmentSubmissionStatus = "draft" | "completed" | "reviewed";
export type AssessmentCategory = "Clinical" | "Stress/Mood" | "Personal" | "Behavioral" | "Other";
export type AssessmentAssignmentStatus = "pending" | "in_progress" | "completed" | "expired";

// Extended type for assessment with questions (used in queries with joins)
export interface AssessmentWithQuestions extends Assessment {
  assessment_questions: (AssessmentQuestion & {
    questions: Question;
  })[];
}

// Extended type for public assessment access
export interface PublicAssessmentData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  allow_multiple_submissions: boolean | null;
  questions: {
    id: string;
    assessment_question_id: string;
    question_text: string;
    question_type: string;
    options: Json | null;
    help_text: string | null;
    is_required: boolean | null;
    question_order: number;
  }[];
}

// Type for question options (used in multiple choice/rating questions)
export interface QuestionOption {
  label: string;
  value: string;
  points?: number;
}

// Type for rating scale configuration
export interface RatingScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

// Extended type for assignment with client info
export interface AssessmentAssignmentWithClient extends AssessmentAssignment {
  clients: {
    id: string;
    full_name: string;
    email: string | null;
  };
}

// Extended type for assessment with counts and assignments
export interface AssessmentWithCounts extends Assessment {
  question_count: number;
  submission_count: number;
  assignment_count: number;
}

// Resource & Module types
export type Module = Tables<"modules">;
export type ModuleInsert = TablesInsert<"modules">;
export type ModuleUpdate = TablesUpdate<"modules">;

export type Resource = Tables<"resources">;
export type ResourceInsert = TablesInsert<"resources">;
export type ResourceUpdate = TablesUpdate<"resources">;

export type ModuleClientAssignment = Tables<"module_client_assignments">;
export type ModuleClientAssignmentInsert = TablesInsert<"module_client_assignments">;
export type ModuleClientAssignmentUpdate = TablesUpdate<"module_client_assignments">;

// Resource type enum
export type ResourceType = "document" | "video" | "audio" | "image" | "url" | "note";

// Extended type for module with counts
export interface ModuleWithCounts extends Module {
  resource_count: number;
  assignment_count: number;
}

// Extended type for resource with module info
export interface ResourceWithModule extends Resource {
  modules?: Pick<Module, "id" | "name" | "color">;
}

// Extended type for module assignment with client info
export interface ModuleClientAssignmentWithClient extends ModuleClientAssignment {
  clients: Pick<Client, "id" | "full_name" | "email">;
}

// Extended type for module assignment with module info
export interface ModuleClientAssignmentWithModule extends ModuleClientAssignment {
  modules: Module;
}

// Resource client assignment types
export type ResourceClientAssignment = Tables<"resource_client_assignments">;
export type ResourceClientAssignmentInsert = TablesInsert<"resource_client_assignments">;
export type ResourceClientAssignmentUpdate = TablesUpdate<"resource_client_assignments">;

// Extended type for resource assignment with client info
export interface ResourceClientAssignmentWithClient extends ResourceClientAssignment {
  clients: Pick<Client, "id" | "full_name" | "email">;
}

// Extended type for resource assignment with resource info
export interface ResourceClientAssignmentWithResource extends ResourceClientAssignment {
  resources: Resource;
}

// Module-resource junction table types
export type ModuleResource = Tables<"module_resources">;
export type ModuleResourceInsert = TablesInsert<"module_resources">;
export type ModuleResourceUpdate = TablesUpdate<"module_resources">;

// Extended type for resource with modules
export interface ResourceWithModules extends Resource {
  module_resources?: Array<{
    id: string;
    module_id: string;
    modules: Pick<Module, "id" | "name" | "color">;
  }>;
}

// Extended type for module with resources (using junction table)
export interface ModuleWithResources extends Module {
  module_resources?: Array<{
    id: string;
    resource_id: string;
    resources: Resource;
  }>;
}

// Resource metadata type (stored in JSON field)
export interface ResourceMetadata {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number; // for video/audio in seconds
  previewImage?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
  };
}


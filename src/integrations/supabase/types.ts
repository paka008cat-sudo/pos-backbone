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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      access_challenges: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          consumed_at: string | null
          consumed_by: string | null
          created_at: string
          expires_at: string
          id: string
          processing_at: string | null
          role: Database["public"]["Enums"]["shop_role"] | null
          shop_id: string | null
          status: string
          token_hash: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          processing_at?: string | null
          role?: Database["public"]["Enums"]["shop_role"] | null
          shop_id?: string | null
          status?: string
          token_hash: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          processing_at?: string | null
          role?: Database["public"]["Enums"]["shop_role"] | null
          shop_id?: string | null
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_challenges_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      access_passes: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          pass_hash: string
          redeemed_at: string | null
          redeemed_by: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["shop_role"]
          shop_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          pass_hash: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
          role: Database["public"]["Enums"]["shop_role"]
          shop_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          pass_hash?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["shop_role"]
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_passes_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          shop_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          shop_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          barcode: string | null
          body_color: string | null
          brand: string | null
          category: string | null
          code: string
          created_at: string
          id: string
          image_url: string | null
          label_color: string | null
          label_text_color: string | null
          name: string
          product_type: Database["public"]["Enums"]["product_type"]
          size: string | null
          suggested_price: number
        }
        Insert: {
          barcode?: string | null
          body_color?: string | null
          brand?: string | null
          category?: string | null
          code: string
          created_at?: string
          id?: string
          image_url?: string | null
          label_color?: string | null
          label_text_color?: string | null
          name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          size?: string | null
          suggested_price?: number
        }
        Update: {
          barcode?: string | null
          body_color?: string | null
          brand?: string | null
          category?: string | null
          code?: string
          created_at?: string
          id?: string
          image_url?: string | null
          label_color?: string | null
          label_text_color?: string | null
          name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          size?: string | null
          suggested_price?: number
        }
        Relationships: []
      }
      client_operations: {
        Row: {
          actor_user_id: string
          completed_at: string | null
          created_at: string
          kind: string
          operation_id: string
          request_payload: Json
          result: Json | null
          shop_id: string
        }
        Insert: {
          actor_user_id: string
          completed_at?: string | null
          created_at?: string
          kind: string
          operation_id: string
          request_payload: Json
          result?: Json | null
          shop_id: string
        }
        Update: {
          actor_user_id?: string
          completed_at?: string | null
          created_at?: string
          kind?: string
          operation_id?: string
          request_payload?: Json
          result?: Json | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_operations_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      counter_stock_balances: {
        Row: {
          product_id: string
          quantity: number
          service_counter_id: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          product_id: string
          quantity?: number
          service_counter_id: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          product_id?: string
          quantity?: number
          service_counter_id?: string
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counter_stock_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_stock_balances_service_counter_id_fkey"
            columns: ["service_counter_id"]
            isOneToOne: false
            referencedRelation: "service_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_stock_balances_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      counter_stock_movements: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          movement_type: string
          note: string | null
          product_id: string
          quantity_delta: number
          related_counter_id: string | null
          service_counter_id: string
          shop_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          movement_type: string
          note?: string | null
          product_id: string
          quantity_delta: number
          related_counter_id?: string | null
          service_counter_id: string
          shop_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          movement_type?: string
          note?: string | null
          product_id?: string
          quantity_delta?: number
          related_counter_id?: string | null
          service_counter_id?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "counter_stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_stock_movements_related_counter_id_fkey"
            columns: ["related_counter_id"]
            isOneToOne: false
            referencedRelation: "service_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_stock_movements_service_counter_id_fkey"
            columns: ["service_counter_id"]
            isOneToOne: false
            referencedRelation: "service_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counter_stock_movements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      dining_tables: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          name: string
          shop_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          name: string
          shop_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          name?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dining_tables_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_recovery_passes: {
        Row: {
          claim_expires_at: string | null
          claim_token: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          pass_hash: string
          redeemed_at: string | null
          revoked_at: string | null
          shop_id: string
          user_id: string
        }
        Insert: {
          claim_expires_at?: string | null
          claim_token?: string | null
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          pass_hash: string
          redeemed_at?: string | null
          revoked_at?: string | null
          shop_id: string
          user_id: string
        }
        Update: {
          claim_expires_at?: string | null
          claim_token?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          pass_hash?: string
          redeemed_at?: string | null
          revoked_at?: string | null
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_recovery_passes_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_working_hours: {
        Row: {
          enabled: boolean
          end_time: string
          shop_id: string
          start_time: string
          updated_at: string
          updated_by: string | null
          user_id: string
          weekday: number
        }
        Insert: {
          enabled?: boolean
          end_time: string
          shop_id: string
          start_time: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          weekday: number
        }
        Update: {
          enabled?: boolean
          end_time?: string
          shop_id?: string
          start_time?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_working_hours_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_subscription_payments: {
        Row: {
          amount_ksh: number
          checkout_request_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          initiated_by: string
          merchant_request_id: string | null
          mpesa_receipt: string | null
          phone_number: string
          plan_days: number
          result_code: number | null
          result_description: string | null
          shop_id: string
          status: string
          transaction_at: string | null
        }
        Insert: {
          amount_ksh: number
          checkout_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          phone_number: string
          plan_days: number
          result_code?: number | null
          result_description?: string | null
          shop_id: string
          status?: string
          transaction_at?: string | null
        }
        Update: {
          amount_ksh?: number
          checkout_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          phone_number?: string
          plan_days?: number
          result_code?: number | null
          result_description?: string | null
          shop_id?: string
          status?: string
          transaction_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_subscription_payments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admin_tokens: {
        Row: {
          auth_user_id: string
          expires_at: string
          issued_at: string
          issued_by: string | null
          last_redeemed_at: string | null
          singleton: boolean
          token_hash: string
        }
        Insert: {
          auth_user_id: string
          expires_at: string
          issued_at?: string
          issued_by?: string | null
          last_redeemed_at?: string | null
          singleton?: boolean
          token_hash: string
        }
        Update: {
          auth_user_id?: string
          expires_at?: string
          issued_at?: string
          issued_by?: string | null
          last_redeemed_at?: string | null
          singleton?: boolean
          token_hash?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          created_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          archived?: boolean
          average_cost?: number
          barcode?: string | null
          body_color?: string | null
          brand?: string | null
          catalog_item_id?: string | null
          category?: string | null
          code: string
          counter_id?: string | null
          created_at?: string
          id?: string
          label_color?: string | null
          label_text_color?: string | null
          name: string
          photo_path?: string | null
          photo_url?: string | null
          price: number
          product_type?: Database["public"]["Enums"]["product_type"]
          sale_units?: Json
          shop_id: string
          size?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean
          average_cost?: number
          barcode?: string | null
          body_color?: string | null
          brand?: string | null
          catalog_item_id?: string | null
          category?: string | null
          code?: string
          counter_id?: string | null
          created_at?: string
          id?: string
          label_color?: string | null
          label_text_color?: string | null
          name?: string
          photo_path?: string | null
          photo_url?: string | null
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          sale_units?: Json
          shop_id?: string
          size?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_counter_id_fkey"
            columns: ["counter_id"]
            isOneToOne: false
            referencedRelation: "service_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_batch_allocations: {
        Row: {
          batch_id: string
          qty: number
          sale_id: string
          unit_cost: number
        }
        Insert: {
          batch_id: string
          qty: number
          sale_id: string
          unit_cost: number
        }
        Update: {
          batch_id?: string
          qty?: number
          sale_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_batch_allocations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_batch_allocations_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          id: string
          payment_method: string
          product_id: string
          product_name: string
          profit_total: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id: string | null
          stock_qty: number
          total: number
          undone_at: string | null
          undone_by: string | null
          unit_cost_total: number
          unit_name: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          payment_method?: string
          product_id: string
          product_name: string
          profit_total?: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id?: string | null
          stock_qty?: number
          total: number
          undone_at?: string | null
          undone_by?: string | null
          unit_cost_total?: number
          unit_name?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          payment_method?: string
          product_id?: string
          product_name?: string
          profit_total?: number
          qty?: number
          shop_id?: string
          sold_by?: string
          source_counter_id?: string | null
          stock_qty?: number
          total?: number
          undone_at?: string | null
          undone_by?: string | null
          unit_cost_total?: number
          unit_name?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_source_counter_id_fkey"
            columns: ["source_counter_id"]
            isOneToOne: false
            referencedRelation: "service_counters"
            referencedColumns: ["id"]
          },
        ]
      }
      service_counters: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          shop_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          shop_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_counters_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_business_hours: {
        Row: {
          close_time: string
          enabled: boolean
          open_time: string
          shop_id: string
          updated_at: string
          updated_by: string | null
          weekday: number
        }
        Insert: {
          close_time: string
          enabled?: boolean
          open_time: string
          shop_id: string
          updated_at?: string
          updated_by?: string | null
          weekday: number
        }
        Update: {
          close_time?: string
          enabled?: boolean
          open_time?: string
          shop_id?: string
          updated_at?: string
          updated_by?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_business_hours_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_members: {
        Row: {
          created_at: string
          display_name: string | null
          employment_status: string
          role: Database["public"]["Enums"]["shop_role"]
          shop_id: string
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          employment_status?: string
          role?: Database["public"]["Enums"]["shop_role"]
          shop_id: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          employment_status?: string
          role?: Database["public"]["Enums"]["shop_role"]
          shop_id?: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_members_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          payment_lock_active: boolean
          payment_lock_amount_ksh: number
          payment_lock_reason: string | null
          payment_lock_started_at: string | null
          payment_lock_started_by: string | null
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        Insert: {
          business_hours_enabled?: boolean
          business_size?: string
          business_type?: string
          closed_at?: string | null
          closed_by?: string | null
          closure_reason?: string | null
          counter_count?: number
          counter_inventory_mode?: string
          created_at?: string
          created_by: string
          currency?: string
          feature_flags?: Json
          id?: string
          last_payment_at?: string | null
          last_payment_phone?: string | null
          last_payment_receipt?: string | null
          low_stock_threshold?: number
          payment_lock_active?: boolean
          payment_lock_amount_ksh?: number
          payment_lock_reason?: string | null
          payment_lock_started_at?: string | null
          payment_lock_started_by?: string | null
          name: string
          owner_email?: string | null
          status?: string
          subscription_ends_at?: string | null
          subscription_plan_days?: number
          subscription_price_ksh?: number
          subscription_status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          timezone?: string
          trial_ends_at?: string | null
        }
        Update: {
          business_hours_enabled?: boolean
          business_size?: string
          business_type?: string
          closed_at?: string | null
          closed_by?: string | null
          closure_reason?: string | null
          counter_count?: number
          counter_inventory_mode?: string
          created_at?: string
          created_by?: string
          currency?: string
          feature_flags?: Json
          id?: string
          last_payment_at?: string | null
          last_payment_phone?: string | null
          last_payment_receipt?: string | null
          low_stock_threshold?: number
          payment_lock_active?: boolean
          payment_lock_amount_ksh?: number
          payment_lock_reason?: string | null
          payment_lock_started_at?: string | null
          payment_lock_started_by?: string | null
          name?: string
          owner_email?: string | null
          status?: string
          subscription_ends_at?: string | null
          subscription_plan_days?: number
          subscription_price_ksh?: number
          subscription_status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          timezone?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      stock_batches: {
        Row: {
          id: string
          notes: string | null
          product_id: string
          receipt_id: string | null
          received_at: string
          received_by: string
          received_qty: number
          reference: string | null
          remaining_qty: number
          shop_id: string
          unit_cost: number
        }
        Insert: {
          id?: string
          notes?: string | null
          product_id: string
          receipt_id?: string | null
          received_at?: string
          received_by: string
          received_qty: number
          reference?: string | null
          remaining_qty: number
          shop_id: string
          unit_cost?: number
        }
        Update: {
          id?: string
          notes?: string | null
          product_id?: string
          receipt_id?: string | null
          received_at?: string
          received_by?: string
          received_qty?: number
          reference?: string | null
          remaining_qty?: number
          shop_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "stock_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_receipts: {
        Row: {
          created_at: string
          id: string
          is_new_product: boolean
          notes: string | null
          product_id: string
          qty: number
          received_by: string
          reference: string | null
          shop_id: string
          supplier: string | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_new_product?: boolean
          notes?: string | null
          product_id: string
          qty: number
          received_by: string
          reference?: string | null
          shop_id: string
          supplier?: string | null
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_new_product?: boolean
          notes?: string | null
          product_id?: string
          qty?: number
          received_by?: string
          reference?: string | null
          shop_id?: string
          supplier?: string | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_receipts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_receipts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      table_bill_settlements: {
        Row: {
          amount: number
          client_operation_id: string
          id: string
          payment_method: string
          settled_at: string
          settled_by: string
          shop_id: string
          table_id: string
        }
        Insert: {
          amount: number
          client_operation_id: string
          id?: string
          payment_method: string
          settled_at?: string
          settled_by: string
          shop_id: string
          table_id: string
        }
        Update: {
          amount?: number
          client_operation_id?: string
          id?: string
          payment_method?: string
          settled_at?: string
          settled_by?: string
          shop_id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_bill_settlements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_bill_settlements_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_orders: {
        Row: {
          id: string
          product_id: string
          product_name: string
          qty: number
          sale_id: string
          served_at: string
          settlement_id: string | null
          shop_id: string
          table_id: string
          total: number
          unit_name: string
          unit_price: number
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          qty: number
          sale_id: string
          served_at?: string
          settlement_id?: string | null
          shop_id: string
          table_id: string
          total: number
          unit_name?: string
          unit_price: number
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          qty?: number
          sale_id?: string
          served_at?: string
          settlement_id?: string | null
          shop_id?: string
          table_id?: string
          total?: number
          unit_name?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "table_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_orders_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "table_bill_settlements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_from_catalog: {
        Args: {
          _catalog: string
          _price?: number
          _qty?: number
          _shop: string
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      add_from_catalog_at_counter:
        | {
            Args: {
              _catalog: string
              _counter: string
              _price: number
              _qty: number
              _shop: string
              _unit_cost?: number
            }
            Returns: {
              archived: boolean
              average_cost: number
              barcode: string | null
              body_color: string | null
              brand: string | null
              catalog_item_id: string | null
              category: string | null
              code: string
              counter_id: string | null
              created_at: string
              id: string
              label_color: string | null
              label_text_color: string | null
              name: string
              photo_path: string | null
              photo_url: string | null
              price: number
              product_type: Database["public"]["Enums"]["product_type"]
              sale_units: Json
              shop_id: string
              size: string | null
              stock: number
              updated_at: string
            }
            SetofOptions: {
              from: "*"
              to: "products"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              _catalog: string
              _counter: string
              _price: number
              _qty: number
              _shop: string
              _unit_cost?: number
            }
            Returns: {
              archived: boolean
              average_cost: number
              barcode: string | null
              body_color: string | null
              brand: string | null
              catalog_item_id: string | null
              category: string | null
              code: string
              counter_id: string | null
              created_at: string
              id: string
              label_color: string | null
              label_text_color: string | null
              name: string
              photo_path: string | null
              photo_url: string | null
              price: number
              product_type: Database["public"]["Enums"]["product_type"]
              sale_units: Json
              shop_id: string
              size: string | null
              stock: number
              updated_at: string
            }
            SetofOptions: {
              from: "*"
              to: "products"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      add_from_catalog_with_cost: {
        Args: {
          _catalog: string
          _price?: number
          _qty?: number
          _shop: string
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      add_member_by_email: {
        Args: {
          _email: string
          _role?: Database["public"]["Enums"]["shop_role"]
          _shop: string
        }
        Returns: undefined
      }
      adjust_counter_stock: {
        Args: {
          _counter: string
          _new_stock: number
          _product: string
          _reason?: string
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      adjust_stock: {
        Args: { _new_stock: number; _product: string; _reason?: string }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_business: {
        Args: {
          _business_size?: string
          _business_type?: string
          _name: string
          _owner_email?: string
        }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_business_profile: {
        Args: {
          _business_size?: string
          _business_type?: string
          _counter_count?: number
          _counter_inventory_mode?: string
          _name: string
          _owner_email?: string
        }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_business_with_counter_setup: {
        Args: {
          _counter_count?: number
          _counter_inventory_mode?: string
          _name: string
          _owner_email?: string
        }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_businesses: {
        Args: never
        Returns: {
          business_size: string
          business_type: string
          closed_at: string
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          feature_flags: Json
          lifecycle_reason: string
          member_count: number
          owner_email: string
          product_count: number
          shop_id: string
          shop_name: string
          status: string
          stock_units: number
          suspended_at: string
        }[]
      }
      admin_get_platform_billing_settings: {
        Args: never
        Returns: Json
      }
      admin_update_platform_billing_settings: {
        Args: {
          p_subscription_price_ksh: number
          p_trial_duration_days: number
        }
        Returns: Json
      }
      admin_list_shop_members: {
        Args: { _shop: string }
        Returns: {
          display_name: string
          email: string
          employment_status: string
          member_user_id: string
          role: string
          schedule: Json
          status_reason: string
        }[]
      }
      admin_set_business_status: {
        Args: { _reason?: string; _shop: string; _status: string }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_pos_operation: {
        Args: {
          _kind: string
          _operation_id: string
          _payload: Json
          _shop: string
        }
        Returns: Json
      }
      apply_pos_operation_legacy: {
        Args: {
          _kind: string
          _operation_id: string
          _payload: Json
          _shop: string
        }
        Returns: Json
      }
      can_sell_for_shop: { Args: { _shop: string }; Returns: boolean }
      clear_employee_schedule: {
        Args: { _shop: string; _user: string }
        Returns: undefined
      }
      complete_employee_recovery_pass: {
        Args: { _claim_token: string; _pass_hash: string }
        Returns: undefined
      }
      counter_sales_report: {
        Args: { _from?: string; _shop: string; _to?: string }
        Returns: {
          counter_id: string
          counter_name: string
          revenue: number
          sale_count: number
          units: number
        }[]
      }
      counter_stock_report: {
        Args: { _counter: string; _shop: string }
        Returns: {
          product_id: string
          quantity: number
        }[]
      }
      create_dining_table: {
        Args: { _name: string; _shop: string }
        Returns: {
          archived: boolean
          created_at: string
          id: string
          name: string
          shop_id: string
        }
        SetofOptions: {
          from: "*"
          to: "dining_tables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_owner_business_profile: {
        Args: {
          _business_size?: string
          _business_type?: string
          _counter_count?: number
          _counter_inventory_mode?: string
          _name: string
        }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_service_counter: {
        Args: { _name: string; _shop: string }
        Returns: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          shop_id: string
        }
        SetofOptions: {
          from: "*"
          to: "service_counters"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_shop: {
        Args: { _name: string }
        Returns: {
          business_hours_enabled: boolean
          business_size: string
          business_type: string
          closed_at: string | null
          closed_by: string | null
          closure_reason: string | null
          counter_count: number
          counter_inventory_mode: string
          created_at: string
          created_by: string
          currency: string
          feature_flags: Json
          id: string
          last_payment_at: string | null
          last_payment_phone: string | null
          last_payment_receipt: string | null
          low_stock_threshold: number
          name: string
          owner_email: string | null
          status: string
          subscription_ends_at: string | null
          subscription_plan_days: number
          subscription_price_ksh: number
          subscription_status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          timezone: string
          trial_ends_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "shops"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      daily_summary: { Args: { _day?: string; _shop: string }; Returns: Json }
      delete_dining_table: {
        Args: { _shop: string; _table: string }
        Returns: undefined
      }
      finalize_mpesa_subscription_payment: {
        Args: {
          p_amount_ksh: number
          p_checkout_request_id: string
          p_mpesa_receipt: string
          p_phone_number: string
          p_result_code: number
        }
        Returns: Json
      }
      find_product: {
        Args: { _query: string; _shop: string }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_business_hours: { Args: { _shop: string }; Returns: Json }
      get_shop_subscription_status: {
        Args: { p_shop_id: string }
        Returns: Json
      }
      has_shop_role: {
        Args: {
          _roles: Database["public"]["Enums"]["shop_role"][]
          _shop: string
        }
        Returns: boolean
      }
      is_inventory_operator: { Args: { _shop: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_shop_active: { Args: { _shop: string }; Returns: boolean }
      is_shop_manager: { Args: { _shop: string }; Returns: boolean }
      is_shop_member: { Args: { _shop: string }; Returns: boolean }
      is_shop_owner: { Args: { _shop: string }; Returns: boolean }
      issue_employee_recovery_pass: {
        Args: {
          _actor: string
          _pass_hash: string
          _shop: string
          _user: string
        }
        Returns: string
      }
      my_account: { Args: never; Returns: Json }
      receive_stock: {
        Args: { _product: string; _qty: number }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      receive_stock_at_counter: {
        Args: {
          _counter: string
          _notes?: string
          _product: string
          _qty: number
          _reference?: string
          _supplier?: string
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      receive_stock_with_cost: {
        Args: {
          _notes?: string
          _product: string
          _qty: number
          _reference?: string
          _supplier?: string
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_sale: {
        Args: { _product: string; _qty?: number }
        Returns: {
          created_at: string
          id: string
          payment_method: string
          product_id: string
          product_name: string
          profit_total: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id: string | null
          stock_qty: number
          total: number
          undone_at: string | null
          undone_by: string | null
          unit_cost_total: number
          unit_name: string
          unit_price: number
        }
        SetofOptions: {
          from: "*"
          to: "sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_sale_unit: {
        Args: {
          _product: string
          _qty?: number
          _unit_name?: string
          _unit_price?: number
        }
        Returns: {
          created_at: string
          id: string
          payment_method: string
          product_id: string
          product_name: string
          profit_total: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id: string | null
          stock_qty: number
          total: number
          undone_at: string | null
          undone_by: string | null
          unit_cost_total: number
          unit_name: string
          unit_price: number
        }
        SetofOptions: {
          from: "*"
          to: "sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_sale_unit_from_counter:
        | {
            Args: {
              _counter: string
              _product: string
              _qty?: number
              _unit_name?: string
              _unit_price?: number
            }
            Returns: {
              created_at: string
              id: string
              payment_method: string
              product_id: string
              product_name: string
              profit_total: number
              qty: number
              shop_id: string
              sold_by: string
              source_counter_id: string | null
              stock_qty: number
              total: number
              undone_at: string | null
              undone_by: string | null
              unit_cost_total: number
              unit_name: string
              unit_price: number
            }
            SetofOptions: {
              from: "*"
              to: "sales"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              _counter: string
              _payment_method: string
              _product: string
              _qty: number
              _unit_name: string
              _unit_price: number
            }
            Returns: {
              created_at: string
              id: string
              payment_method: string
              product_id: string
              product_name: string
              profit_total: number
              qty: number
              shop_id: string
              sold_by: string
              source_counter_id: string | null
              stock_qty: number
              total: number
              undone_at: string | null
              undone_by: string | null
              unit_cost_total: number
              unit_name: string
              unit_price: number
            }
            SetofOptions: {
              from: "*"
              to: "sales"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      record_table_sale: {
        Args: {
          _product: string
          _qty: number
          _shop: string
          _table: string
          _unit_name: string
          _unit_price: number
        }
        Returns: {
          id: string
          product_id: string
          product_name: string
          qty: number
          sale_id: string
          served_at: string
          settlement_id: string | null
          shop_id: string
          table_id: string
          total: number
          unit_name: string
          unit_price: number
        }
        SetofOptions: {
          from: "*"
          to: "table_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_table_sale_from_counter:
        | {
            Args: {
              _counter: string
              _product: string
              _qty: number
              _shop: string
              _table: string
              _unit_name: string
              _unit_price: number
            }
            Returns: {
              id: string
              product_id: string
              product_name: string
              qty: number
              sale_id: string
              served_at: string
              settlement_id: string | null
              shop_id: string
              table_id: string
              total: number
              unit_name: string
              unit_price: number
            }
            SetofOptions: {
              from: "*"
              to: "table_orders"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              _counter: string
              _payment_method: string
              _product: string
              _qty: number
              _shop: string
              _table: string
              _unit_name: string
              _unit_price: number
            }
            Returns: {
              id: string
              product_id: string
              product_name: string
              qty: number
              sale_id: string
              served_at: string
              settlement_id: string | null
              shop_id: string
              table_id: string
              total: number
              unit_name: string
              unit_price: number
            }
            SetofOptions: {
              from: "*"
              to: "table_orders"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      redeem_access_pass_atomic: {
        Args: { _pass_hash: string; _user: string }
        Returns: Json
      }
      redeem_employee_recovery_pass_atomic: {
        Args: { _pass_hash: string }
        Returns: Json
      }
      register_product: {
        Args: {
          _brand?: string
          _category?: string
          _code: string
          _name: string
          _photo_path: string
          _price: number
          _qty: number
          _shop: string
          _size?: string
          _type?: Database["public"]["Enums"]["product_type"]
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_product_at_counter: {
        Args: {
          _brand?: string
          _category?: string
          _code: string
          _counter: string
          _name: string
          _photo_path: string
          _price: number
          _qty: number
          _shop: string
          _size?: string
          _type?: Database["public"]["Enums"]["product_type"]
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_product_at_counter_with_units: {
        Args: {
          _brand?: string
          _category?: string
          _code: string
          _counter: string
          _name: string
          _photo_path: string
          _price: number
          _qty: number
          _sale_units?: Json
          _shop: string
          _size?: string
          _type?: Database["public"]["Enums"]["product_type"]
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_product_with_cost: {
        Args: {
          _brand?: string
          _category?: string
          _code: string
          _name: string
          _photo_path: string
          _price: number
          _qty: number
          _shop: string
          _size?: string
          _type?: Database["public"]["Enums"]["product_type"]
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_product_with_units: {
        Args: {
          _brand?: string
          _category?: string
          _code: string
          _name: string
          _photo_path: string
          _price: number
          _qty: number
          _sale_units?: Json
          _shop: string
          _size?: string
          _type?: Database["public"]["Enums"]["product_type"]
          _unit_cost?: number
        }
        Returns: {
          archived: boolean
          average_cost: number
          barcode: string | null
          body_color: string | null
          brand: string | null
          catalog_item_id: string | null
          category: string | null
          code: string
          counter_id: string | null
          created_at: string
          id: string
          label_color: string | null
          label_text_color: string | null
          name: string
          photo_path: string | null
          photo_url: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_units: Json
          shop_id: string
          size: string | null
          stock: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_employee_access: {
        Args: { _reason?: string; _shop: string; _user: string }
        Returns: undefined
      }
      rename_service_counter: {
        Args: { _counter: string; _name: string; _shop: string }
        Returns: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          shop_id: string
        }
        SetofOptions: {
          from: "*"
          to: "service_counters"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_business_hours: {
        Args: { _days: Json; _enabled: boolean; _shop: string }
        Returns: Json
      }
      set_employee_display_name: {
        Args: { _display_name: string; _shop: string; _user: string }
        Returns: undefined
      }
      set_employee_role: {
        Args: {
          _role: Database["public"]["Enums"]["shop_role"]
          _shop: string
          _user: string
        }
        Returns: undefined
      }
      set_employee_status: {
        Args: {
          _reason?: string
          _shop: string
          _status: string
          _user: string
        }
        Returns: undefined
      }
      set_employee_working_hours: {
        Args: {
          _enabled?: boolean
          _end: string
          _shop: string
          _start: string
          _user: string
          _weekday: number
        }
        Returns: undefined
      }
      set_service_counter_active: {
        Args: { _active: boolean; _counter: string }
        Returns: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          shop_id: string
        }
        SetofOptions: {
          from: "*"
          to: "service_counters"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      settle_table_bill: {
        Args: {
          _operation_id: string
          _payment_method: string
          _shop: string
          _table: string
        }
        Returns: Json
      }
      transfer_counter_stock: {
        Args: {
          _from_counter: string
          _product: string
          _qty: number
          _reason?: string
          _shop: string
          _to_counter: string
        }
        Returns: undefined
      }
      undo_sale: {
        Args: { _sale?: string; _shop: string }
        Returns: {
          created_at: string
          id: string
          payment_method: string
          product_id: string
          product_name: string
          profit_total: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id: string | null
          stock_qty: number
          total: number
          undone_at: string | null
          undone_by: string | null
          unit_cost_total: number
          unit_name: string
          unit_price: number
        }
        SetofOptions: {
          from: "*"
          to: "sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      undo_sale_from_counter: {
        Args: { _shop: string }
        Returns: {
          created_at: string
          id: string
          payment_method: string
          product_id: string
          product_name: string
          profit_total: number
          qty: number
          shop_id: string
          sold_by: string
          source_counter_id: string | null
          stock_qty: number
          total: number
          undone_at: string | null
          undone_by: string | null
          unit_cost_total: number
          unit_name: string
          unit_price: number
        }
        SetofOptions: {
          from: "*"
          to: "sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_shop_name: {
        Args: { _name: string; _shop: string }
        Returns: undefined
      }
      validate_product_sale_units: {
        Args: { _sale_units: Json }
        Returns: Json
      }
      write_audit_event: {
        Args: {
          _action: string
          _entity_id: string
          _entity_type: string
          _metadata?: Json
          _shop: string
        }
        Returns: undefined
      }
    }
    Enums: {
      product_type: "beer" | "spirit"
      shop_role: "owner" | "cashier" | "manager" | "inventory_clerk"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      product_type: ["beer", "spirit"],
      shop_role: ["owner", "cashier", "manager", "inventory_clerk"],
    },
  },
} as const

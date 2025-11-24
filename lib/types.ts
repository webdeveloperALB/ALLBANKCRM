export interface User {
  id: string;
  email: string | null;
  password: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  age: number | null;
  created_at: string | null;
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected';
  is_admin: boolean | null;
  is_manager: boolean | null;
  is_superiormanager: boolean | null;
  bank_origin: string;
}

export interface UserWithBank extends User {
  bank_key: string;
  bank_name: string;
  bank_total_count?: number;
}

export interface KYCVerification {
  id: string;
  user_id: string;
  document_type: 'passport' | 'id_card' | null;
  document_number: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  id_document_path: string | null;
  driver_license_path: string | null;
  utility_bill_path: string | null;
  selfie_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FiatBalance {
  id: string;
  user_id: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface CryptoBalance {
  id: string;
  user_id: string;
  btc_balance: string;
  eth_balance: string;
  usdt_balance: string;
  created_at: string;
  updated_at: string;
}

export interface UserBalances {
  usd: FiatBalance | null;
  euro: FiatBalance | null;
  cad: FiatBalance | null;
  crypto: CryptoBalance | null;
}

export interface UserPresence {
  id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  region: string | null;
}

export type ActivityType =
  | 'admin_notification' | 'system_update' | 'security_alert' | 'account_notice'
  | 'service_announcement' | 'maintenance_notice' | 'policy_update' | 'feature_announcement'
  | 'account_credit' | 'account_debit' | 'transfer_notification' | 'deposit_notification'
  | 'withdrawal_notification' | 'payment_notification' | 'balance_inquiry' | 'transaction_alert'
  | 'receipt_notification' | 'wire_transfer' | 'ach_transfer' | 'check_deposit'
  | 'card_transaction' | 'mobile_payment' | 'online_banking' | 'account_opening'
  | 'account_closure' | 'account_freeze' | 'account_unfreeze' | 'limit_change'
  | 'fraud_alert' | 'kyc_update' | 'compliance_notice' | 'statement_ready'
  | 'promotional_offer' | 'service_update' | 'support_response' | 'appointment_reminder'
  | 'document_request';

export type ActivityStatus = 'active' | 'archived' | 'deleted';
export type ActivityPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ActivityCurrency = 'usd' | 'euro' | 'cad' | 'gbp' | 'jpy' | 'crypto';

export interface AccountActivity {
  id: string;
  user_id: string;
  client_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  currency: ActivityCurrency;
  display_amount: number;
  status: ActivityStatus;
  priority: ActivityPriority;
  is_read: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export interface ExternalAccount {
  id: string;
  user_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string | null;
  account_type: string;
  currency: string;
  is_verified: boolean;
  created_at: string;
}

export type TransferStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
export type TransferType = 'internal' | 'bank' | 'crypto' | 'bank_transfer' | 'admin_balance_adjustment';

export interface Transfer {
  id: number | string;
  user_id: string;
  client_id: string | null;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  exchange_rate: string;
  status: TransferStatus;
  transfer_type: TransferType;
  description: string | null;
  fee_amount: string;
  processed_at: string | null;
  reference_number: string | null;
  created_at: string;
}

export interface BankTransfer {
  id: string;
  transfer_id: number | string | null;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string | null;
  swift_code: string | null;
  iban: string | null;
  bank_address: string | null;
  recipient_address: string | null;
  purpose_of_transfer: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferWithBankDetails extends Transfer {
  bank_details?: BankTransfer;
}

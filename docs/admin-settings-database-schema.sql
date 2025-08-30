-- ================================================
-- NOMAD LUX - ADMIN SETTINGS DATABASE SCHEMA
-- ================================================

-- Create enums for settings categorization
CREATE TYPE setting_category_enum AS ENUM (
    'general', 'booking', 'payment', 'notifications', 'security', 'content'
);

CREATE TYPE setting_data_type_enum AS ENUM (
    'string', 'number', 'boolean', 'array', 'object'
);

-- ================================================
-- ADMIN SETTINGS TABLE
-- ================================================

CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category setting_category_enum NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    data_type setting_data_type_enum NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_system_setting BOOLEAN DEFAULT false, -- Prevents accidental deletion
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(category, setting_key)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Optimized indexes for settings queries
CREATE INDEX idx_admin_settings_category ON admin_settings(category);
CREATE INDEX idx_admin_settings_lookup ON admin_settings(category, setting_key);
CREATE INDEX idx_admin_settings_updated ON admin_settings(updated_at DESC);
CREATE INDEX idx_admin_settings_system ON admin_settings(is_system_setting) WHERE is_system_setting = true;

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin settings access control
CREATE POLICY admin_settings_access ON admin_settings
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('admin', 'super_admin') AND action = 'SELECT')
    );

-- Prevent non-admins from accessing settings
CREATE POLICY admin_settings_no_public ON admin_settings
    FOR ALL TO anon
    USING (false);

-- ================================================
-- DEFAULT SETTINGS DATA
-- ================================================

-- Insert default general settings
INSERT INTO admin_settings (category, setting_key, setting_value, data_type, description, is_system_setting) VALUES
-- General Settings
('general', 'siteName', '"Nomad Lux"', 'string', 'Platform name displayed across the site', true),
('general', 'siteDescription', '"Premium property rental platform"', 'string', 'Platform description for SEO and marketing', true),
('general', 'contactEmail', '"admin@nomadlux.com"', 'string', 'Primary contact email for platform', true),
('general', 'supportEmail', '"support@nomadlux.com"', 'string', 'Customer support email address', true),
('general', 'defaultLanguage', '"en"', 'string', 'Default platform language', true),
('general', 'timezone', '"UTC"', 'string', 'Default platform timezone', true),
('general', 'maintenanceMode', 'false', 'boolean', 'Temporarily disable public access', true),
('general', 'registrationEnabled', 'true', 'boolean', 'Allow new users to register', true),
('general', 'maxFileSize', '10', 'number', 'Maximum file upload size in MB', true),
('general', 'allowedImageFormats', '["jpg", "jpeg", "png", "webp"]', 'array', 'Supported image file formats', true),

-- Booking Settings
('booking', 'commissionRate', '10', 'number', 'Platform commission rate percentage', true),
('booking', 'maxAdvanceBooking', '365', 'number', 'Maximum days in advance for booking', true),
('booking', 'minAdvanceBooking', '1', 'number', 'Minimum days in advance for booking', true),
('booking', 'cancellationGracePeriod', '24', 'number', 'Hours for free cancellation', true),
('booking', 'autoApprovalEnabled', 'false', 'boolean', 'Automatically approve eligible bookings', true),
('booking', 'instantBookingEnabled', 'true', 'boolean', 'Allow instant booking without host approval', true),
('booking', 'minimumStay', '1', 'number', 'Minimum nights required for booking', true),
('booking', 'maximumStay', '30', 'number', 'Maximum nights allowed for booking', true),
('booking', 'paymentProcessingFee', '2.9', 'number', 'Payment processing fee percentage', true),
('booking', 'hostPayoutDelay', '1', 'number', 'Days before host receives payment', true),

-- Payment Settings
('payment', 'stripePublicKey', '"pk_test_..."', 'string', 'Stripe API public key', false),
('payment', 'defaultCurrency', '"USD"', 'string', 'Default platform currency', true),
('payment', 'supportedCurrencies', '["USD", "EUR", "GBP", "CAD", "XOF", "XAF"]', 'array', 'List of supported currencies', true),
('payment', 'autoPayoutEnabled', 'true', 'boolean', 'Automatically process host payouts', true),
('payment', 'minimumPayoutAmount', '50', 'number', 'Minimum amount for host payouts', true),
('payment', 'payoutSchedule', '"weekly"', 'string', 'Host payout frequency (daily/weekly/monthly)', true),
('payment', 'chargeTaxes', 'true', 'boolean', 'Automatically calculate and charge taxes', true),
('payment', 'taxRate', '8.5', 'number', 'Default tax rate percentage', true),

-- Notification Settings
('notifications', 'emailNotifications', 'true', 'boolean', 'Send notifications via email', true),
('notifications', 'smsNotifications', 'false', 'boolean', 'Send notifications via SMS', true),
('notifications', 'pushNotifications', 'true', 'boolean', 'Send browser push notifications', true),
('notifications', 'marketingEmails', 'true', 'boolean', 'Send promotional and marketing content', true),
('notifications', 'bookingConfirmations', 'true', 'boolean', 'Send new booking notifications', true),
('notifications', 'paymentNotifications', 'true', 'boolean', 'Send payment success/failure alerts', true),
('notifications', 'disputeAlerts', 'true', 'boolean', 'Send dispute and issue notifications', true),
('notifications', 'systemAlerts', 'true', 'boolean', 'Send system maintenance and updates', true),
('notifications', 'weeklyReports', 'true', 'boolean', 'Send weekly platform statistics', true),
('notifications', 'monthlyReports', 'true', 'boolean', 'Send monthly platform statistics', true),

-- Security Settings
('security', 'twoFactorRequired', 'false', 'boolean', 'Require 2FA for all admin accounts', true),
('security', 'passwordMinLength', '8', 'number', 'Minimum password length requirement', true),
('security', 'passwordRequireSpecialChars', 'true', 'boolean', 'Passwords must contain special characters', true),
('security', 'sessionTimeout', '60', 'number', 'Session timeout in minutes', true),
('security', 'maxLoginAttempts', '5', 'number', 'Maximum failed login attempts', true),
('security', 'ipWhitelist', '""', 'string', 'Restrict admin access to specific IP addresses', false),
('security', 'apiRateLimit', '1000', 'number', 'API requests per hour limit', true),
('security', 'enableAuditLog', 'true', 'boolean', 'Log all admin actions and changes', true),
('security', 'dataRetentionPeriod', '365', 'number', 'Days to keep user data after account deletion', true),
('security', 'encryptUserData', 'true', 'boolean', 'Encrypt sensitive user information', true),

-- Content Settings
('content', 'termsOfService', '""', 'string', 'Legal terms and conditions for platform use', false),
('content', 'privacyPolicy', '""', 'string', 'Privacy policy and data handling practices', false),
('content', 'hostGuidelines', '""', 'string', 'Guidelines and rules for property hosts', false),
('content', 'guestGuidelines', '""', 'string', 'Guidelines and rules for guests', false),
('content', 'cancellationPolicy', '""', 'string', 'Default cancellation policy text', false);

-- ================================================
-- ENCRYPTED SETTINGS TABLE (For sensitive data)
-- ================================================

CREATE TABLE admin_settings_encrypted (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID REFERENCES admin_settings(id) ON DELETE CASCADE,
    encrypted_value TEXT NOT NULL, -- pgp_sym_encrypt result
    encryption_method TEXT DEFAULT 'pgp_sym',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for encrypted settings
ALTER TABLE admin_settings_encrypted ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_settings_encrypted_access ON admin_settings_encrypted
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_admin_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp updates
CREATE TRIGGER update_admin_settings_timestamp_trigger
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_settings_timestamp();

-- Add reject_reason column to bookings table
ALTER TABLE bookings ADD COLUMN reject_reason TEXT; 
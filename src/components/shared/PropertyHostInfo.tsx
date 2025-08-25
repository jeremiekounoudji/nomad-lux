import React from 'react';
import { Star, Clock, MessageSquare, Mail, Phone, Shield } from 'lucide-react';
import { Avatar, Badge, Button } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';
import { Property } from '../../interfaces/Property';

interface PropertyHostInfoProps {
  property: Property;
  onContactOpen: () => void;
}

const PropertyHostInfo: React.FC<PropertyHostInfoProps> = ({
  property,
  onContactOpen
}) => {
  const { t } = useTranslation(['property', 'common']);

  // Early return if property or host is not available
  if (!property || !property.host) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">{t('property.host.title')}</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center py-8">
            <p className="text-gray-500">{t('property.host.notAvailable', 'Host information not available')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">{t('property.host.title')}</h2>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <Avatar
            src={property.host?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.host?.display_name || property.host?.name || 'Host')}&background=3B82F6&color=fff`}
            alt={property.host?.display_name || property.host?.name || 'Host'}
            className="w-16 h-16"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-medium">{property.host?.display_name || property.host?.name || t('property.host.defaultName', 'Host')}</h3>
              {property.host?.is_identity_verified && (
                <Badge color="success" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {t('property.host.verified')}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{(property.host?.rating || 0).toFixed(1)} {t('property.host.rating')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{t('property.host.hostSince')} {new Date(property.created_at).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{property.host?.response_rate || 0}% {t('property.host.responseRate')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{property.host?.response_time || t('property.host.defaultResponseTime', 'N/A')} {t('property.host.avgResponseTime')}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{property.host?.bio || t('property.host.defaultBio')}</p>
            <div className="flex flex-wrap gap-4">
              {property.host?.is_email_verified && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{t('property.host.emailVerified')}</span>
                </div>
              )}
              {property.host?.phone && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{t('property.host.phoneVerified')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="flat" 
            onClick={onContactOpen}
            className="w-full sm:w-auto bg-primary-500 text-white"
          >
            {t('property.actions.contactHost')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHostInfo;

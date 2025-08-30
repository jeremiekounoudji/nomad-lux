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
        <h2 className="mb-4 text-2xl font-semibold">{t('property.host.title')}</h2>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="py-8 text-center">
            <p className="text-gray-500">{t('property.host.notAvailable', 'Host information not available')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold">{t('property.host.title')}</h2>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <Avatar
            src={property.host?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.host?.display_name || property.host?.name || 'Host')}&background=3B82F6&color=fff`}
            alt={property.host?.display_name || property.host?.name || 'Host'}
            className="size-16"
          />
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xl font-medium">{property.host?.display_name || property.host?.name || t('property.host.defaultName', 'Host')}</h3>
              {property.host?.is_identity_verified && (
                <Badge color="success" className="flex items-center gap-1">
                  <Shield className="size-4" />
                  {t('property.host.verified')}
                </Badge>
              )}
            </div>
            <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="size-4 text-yellow-400" />
                <span>{(property.host?.rating || 0).toFixed(1)} {t('property.host.rating')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{t('property.host.hostSince')} {new Date(property.created_at).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="size-4" />
                <span>{property.host?.response_rate || 0}% {t('property.host.responseRate')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>{property.host?.response_time || t('property.host.defaultResponseTime', 'N/A')} {t('property.host.avgResponseTime')}</span>
              </div>
            </div>
            <p className="mb-4 text-gray-600">{property.host?.bio || t('property.host.defaultBio')}</p>
            <div className="flex flex-wrap gap-4">
              {property.host?.is_email_verified && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="size-4" />
                  <span>{t('property.host.emailVerified')}</span>
                </div>
              )}
              {property.host?.phone && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="size-4" />
                  <span>{t('property.host.phoneVerified')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Button 
            variant="flat" 
            onClick={onContactOpen}
            className="w-full bg-primary-500 text-white sm:w-auto"
          >
            {t('property.actions.contactHost')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHostInfo;

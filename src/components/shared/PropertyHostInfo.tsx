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
  const { t } = useTranslation('property');

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">{t('property.host.title')}</h2>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <Avatar
            src={property.host.avatar_url}
            alt={property.host.name}
            className="w-16 h-16"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-medium">{property.host.display_name}</h3>
              {property.host.is_identity_verified && (
                <Badge color="success" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{property.host.rating.toFixed(1)} Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Host since {new Date(property.created_at).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{property.host.response_rate}% Response rate</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{property.host.response_time} avg. response time</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{property.host.bio || t('property.host.defaultBio')}</p>
            <div className="flex flex-wrap gap-4">
              {property.host.is_email_verified && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{t('property.host.emailVerified')}</span>
                </div>
              )}
              {property.host.phone && (
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

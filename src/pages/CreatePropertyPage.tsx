import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm';

import { CreatePropertyPageProps } from '../interfaces'

const CreatePropertyPage: React.FC<CreatePropertyPageProps> = ({ onPageChange }) => {
  return (
    <MainLayout currentPage="create" onPageChange={onPageChange}>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Submit Your Property
            </h1>
            <p className="text-gray-600">
              Share your property with travelers around the world. Fill out the form below to submit your property for review.
            </p>
          </div>
          <PropertySubmissionForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePropertyPage; 
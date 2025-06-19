import React from 'react'
import { Search } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'

import { SearchPageProps } from '../interfaces'

const SearchPage: React.FC<SearchPageProps> = ({ onPageChange }) => {
  return (
    <MainLayout currentPage="search" onPageChange={onPageChange}>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Search Properties
        </h3>
        <p className="text-gray-500">
          Search functionality coming soon...
        </p>
      </div>
    </MainLayout>
  )
}

export default SearchPage 
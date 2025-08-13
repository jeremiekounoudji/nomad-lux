import React, { useMemo, useState } from 'react'
import { Button, Accordion, AccordionItem, Input, Card, CardBody, Chip } from '@heroui/react'
import { ArrowLeft, Search, MessageCircle, Mail, Phone, HelpCircle, BookOpen, Home } from 'lucide-react'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { useTranslation } from '../lib/stores/translationStore'

interface HelpPageProps {
  onPageChange?: (page: string) => void
}

const HelpPage: React.FC<HelpPageProps> = ({ onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation(['help', 'common'])
  
  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  const faqData = [
    {
      id: 'getting-started',
      titleKey: 'help.categories.gettingStarted.title',
      icon: BookOpen,
      color: 'primary',
      faqs: [
        { questionKey: 'help.categories.gettingStarted.faqs.q1.question', answerKey: 'help.categories.gettingStarted.faqs.q1.answer' },
        { questionKey: 'help.categories.gettingStarted.faqs.q2.question', answerKey: 'help.categories.gettingStarted.faqs.q2.answer' },
        { questionKey: 'help.categories.gettingStarted.faqs.q3.question', answerKey: 'help.categories.gettingStarted.faqs.q3.answer' },
        { questionKey: 'help.categories.gettingStarted.faqs.q4.question', answerKey: 'help.categories.gettingStarted.faqs.q4.answer' }
      ]
    },
    {
      id: 'booking-stays',
      titleKey: 'help.categories.bookingStays.title',
      icon: Home,
      color: 'success',
      faqs: [
        { questionKey: 'help.categories.bookingStays.faqs.q1.question', answerKey: 'help.categories.bookingStays.faqs.q1.answer' },
        { questionKey: 'help.categories.bookingStays.faqs.q2.question', answerKey: 'help.categories.bookingStays.faqs.q2.answer' },
        { questionKey: 'help.categories.bookingStays.faqs.q3.question', answerKey: 'help.categories.bookingStays.faqs.q3.answer' },
        { questionKey: 'help.categories.bookingStays.faqs.q4.question', answerKey: 'help.categories.bookingStays.faqs.q4.answer' }
      ]
    }
  ]

  const faqCategories = useMemo(() => {
    return faqData.map((category) => ({
      id: category.id,
      title: t(category.titleKey),
      icon: category.icon,
      color: category.color,
      faqs: category.faqs.map((faq) => ({
        question: t(faq.questionKey),
        answer: t(faq.answerKey)
      }))
    }))
  }, [t])

  const contactOptions = useMemo(() => ([
    {
      title: t('help.contact.liveChat.title'),
      description: t('help.contact.liveChat.description'),
      icon: MessageCircle,
      color: 'primary',
      action: () => console.log('Open live chat'),
      available: t('help.contact.liveChat.available')
    },
    {
      title: t('help.contact.email.title'),
      description: t('help.contact.email.description'),
      icon: Mail,
      color: 'secondary',
      action: () => (window.location.href = 'mailto:support@nomadlux.com'),
      available: t('help.contact.email.available')
    },
    {
      title: t('help.contact.phone.title'),
      description: t('help.contact.phone.description'),
      icon: Phone,
      color: 'success',
      action: () => (window.location.href = 'tel:+1-800-NOMAD-LUX'),
      available: t('help.contact.phone.available')
    }
  ]), [t])

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <>
      {/* Back Button */}
      <div className="col-span-full sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              isIconOnly
              variant="light"
              onPress={handleBackToHome}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('help.header.title')}</h1>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="col-span-full mb-6">
        {/* Banner Header */}
        <PageBanner
          backgroundImage={getBannerConfig('help').image}
          title={t('help.banner.title')}
          subtitle={t('help.banner.subtitle')}
          imageAlt={t('common.pageBanner.help')}
          overlayOpacity={getBannerConfig('help').overlayOpacity}
          height={getBannerConfig('help').height}
          className="mb-8"
        />

        {/* Search Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center mb-6">
            <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('help.search.title')}</h2>
            <p className="text-gray-600">{t('help.search.description')}</p>
          </div>
          
          <Input
            placeholder={t('help.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-5 h-5 text-gray-400" />}
            size="lg"
            className="max-w-2xl mx-auto"
            classNames={{
              input: "text-lg",
              inputWrapper: "h-14"
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">24/7</div>
            <div className="text-sm text-gray-600">{t('help.stats.supportAvailable')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">98%</div>
            <div className="text-sm text-gray-600">{t('help.stats.issueResolution')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">&lt;2h</div>
            <div className="text-sm text-gray-600">{t('help.stats.avgResponse')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary-600">50+</div>
            <div className="text-sm text-gray-600">{t('help.stats.helpArticles')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('help.faq.title')}</h2>
            
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('help.emptyState.title')}</h3>
                  <p className="text-gray-600">{t('help.emptyState.description')}</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFAQs.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Card key={category.id} className="overflow-hidden">
                      <CardBody className="p-0">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-${category.color}-100 flex items-center justify-center`}>
                              <IconComponent className={`w-5 h-5 text-${category.color}-600`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                              <p className="text-sm text-gray-600">{t('help.articlesCount', { count: category.faqs.length })}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Accordion variant="light" className="px-6">
                          {category.faqs.map((faq, index) => (
                            <AccordionItem
                              key={index}
                              aria-label={faq.question}
                              title={faq.question}
                              classNames={{
                                title: "text-left font-medium text-gray-900",
                                content: "text-gray-600 leading-relaxed"
                              }}
                            >
                              {faq.answer}
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Contact Support Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('help.contact.title')}</h3>
                <p className="text-gray-600 mb-6">{t('help.contact.description')}</p>
                
                <div className="space-y-4">
                  {contactOptions.map((option, index) => {
                    const IconComponent = option.icon
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer" onClick={option.action}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-${option.color}-100 flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 text-${option.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{option.title}</h4>
                            <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                            <Chip size="sm" variant="flat" color={option.color as any}>
                              {option.available}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('help.popularArticles.title')}</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm hover:underline">{t('help.popularArticles.cancelOrModifyBooking')}</a>
                  <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm hover:underline">{t('help.popularArticles.understandingServiceFees')}</a>
                  <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm hover:underline">{t('help.popularArticles.guestVerificationProcess')}</a>
                  <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm hover:underline">{t('help.popularArticles.hostPayoutSchedule')}</a>
                  <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm hover:underline">{t('help.popularArticles.propertySafetyRequirements')}</a>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default HelpPage
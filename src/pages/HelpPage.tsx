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
      titleKey: 'help:categories.gettingStarted.title',
      icon: BookOpen,
      color: 'primary',
      faqs: [
        { questionKey: 'help:categories.gettingStarted.faqs.q1.question', answerKey: 'help:categories.gettingStarted.faqs.q1.answer' },
        { questionKey: 'help:categories.gettingStarted.faqs.q2.question', answerKey: 'help:categories.gettingStarted.faqs.q2.answer' },
        { questionKey: 'help:categories.gettingStarted.faqs.q3.question', answerKey: 'help:categories.gettingStarted.faqs.q3.answer' },
        { questionKey: 'help:categories.gettingStarted.faqs.q4.question', answerKey: 'help:categories.gettingStarted.faqs.q4.answer' }
      ]
    },
    {
      id: 'booking-stays',
      titleKey: 'help:categories.bookingStays.title',
      icon: Home,
      color: 'success',
      faqs: [
        { questionKey: 'help:categories.bookingStays.faqs.q1.question', answerKey: 'help:categories.bookingStays.faqs.q1.answer' },
        { questionKey: 'help:categories.bookingStays.faqs.q2.question', answerKey: 'help:categories.bookingStays.faqs.q2.answer' },
        { questionKey: 'help:categories.bookingStays.faqs.q3.question', answerKey: 'help:categories.bookingStays.faqs.q3.answer' },
        { questionKey: 'help:categories.bookingStays.faqs.q4.question', answerKey: 'help:categories.bookingStays.faqs.q4.answer' }
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
      title: t('help:contact.liveChat.title'),
      description: t('help:contact.liveChat.description'),
      icon: MessageCircle,
      color: 'primary',
      action: () => console.log(t('help:contact.liveChat.action')),
      available: t('help:contact.liveChat.available')
    },
    {
      title: t('help:contact.email.title'),
      description: t('help:contact.email.description'),
      icon: Mail,
      color: 'secondary',
      action: () => (window.location.href = `mailto:${t('help:contact.email.address')}`),
      available: t('help:contact.email.available')
    },
    {
      title: t('help:contact.phone.title'),
      description: t('help:contact.phone.description'),
      icon: Phone,
      color: 'success',
      action: () => (window.location.href = `tel:${t('help:contact.phone.number')}`),
      available: t('help:contact.phone.available')
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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center">
            <Button
              isIconOnly
              variant="light"
              onPress={handleBackToHome}
              className="mr-4"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('help:header.title')}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
              <div className="mx-auto max-w-7xl">
        {/* Banner Header */}
        <PageBanner
          backgroundImage={getBannerConfig('help').image}
          title={t('help:banner.title')}
          subtitle={t('help:banner.subtitle')}
          imageAlt={t('common.pageBanner.help')}
          overlayOpacity={getBannerConfig('help').overlayOpacity}
          height={getBannerConfig('help').height}
          className="mb-8"
        />

        {/* Search Section */}
        <div className="mx-auto mb-8 max-w-4xl">
          <div className="mb-6 text-center">
            <HelpCircle className="mx-auto mb-4 size-16 text-primary-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('help:search.title')}</h2>
            <p className="text-gray-600">{t('help:search.description')}</p>
          </div>
          
          <Input
            placeholder={t('help:search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="size-5 text-gray-400" />}
            size="lg"
            className="mx-auto max-w-2xl"
            classNames={{
              input: "text-lg",
              inputWrapper: "h-14"
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">24/7</div>
            <div className="text-sm text-gray-600">{t('help:stats.supportAvailable')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">98%</div>
            <div className="text-sm text-gray-600">{t('help:stats.issueResolution')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">&lt;2h</div>
            <div className="text-sm text-gray-600">{t('help:stats.avgResponse')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary-600">50+</div>
            <div className="text-sm text-gray-600">{t('help:stats.helpArticles')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('help:faq.title')}</h2>
            
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardBody className="py-12 text-center">
                  <Search className="mx-auto mb-4 size-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">{t('help:emptyState.title')}</h3>
                  <p className="text-gray-600">{t('help:emptyState.description')}</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFAQs.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Card key={category.id} className="overflow-hidden">
                      <CardBody className="p-0">
                        <div className="border-b border-gray-100 p-6">
                          <div className="flex items-center gap-3">
                            <div className={`bg- size-10 rounded-lg${category.color}-100 flex items-center justify-center`}>
                              <IconComponent className={`text- size-5${category.color}-600`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                              <p className="text-sm text-gray-600">{t('help:articlesCount', { count: category.faqs.length })}</p>
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
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('help:contact.title')}</h3>
                <p className="mb-6 text-gray-600">{t('help:contact.description')}</p>
                
                <div className="space-y-4">
                  {contactOptions.map((option, index) => {
                    const IconComponent = option.icon
                    return (
                      <div key={index} className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-primary-300" onClick={option.action}>
                        <div className="flex items-start gap-3">
                          <div className={`bg- size-10 rounded-lg${option.color}-100 flex shrink-0 items-center justify-center`}>
                            <IconComponent className={`text- size-5${option.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{option.title}</h4>
                            <p className="mb-1 text-sm text-gray-600">{option.description}</p>
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
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('help:popularArticles.title')}</h3>
                <div className="space-y-3">
                                      <a href="#" className="block text-sm text-primary-600 hover:text-primary-700 hover:underline">{t('help:popularArticles.cancelOrModifyBooking')}</a>
                    <a href="#" className="block text-sm text-primary-600 hover:text-primary-700 hover:underline">{t('help:popularArticles.understandingServiceFees')}</a>
                    <a href="#" className="block text-sm text-primary-600 hover:text-primary-700 hover:underline">{t('help:popularArticles.guestVerificationProcess')}</a>
                    <a href="#" className="block text-sm text-primary-600 hover:text-primary-700 hover:underline">{t('help:popularArticles.hostPayoutSchedule')}</a>
                    <a href="#" className="block text-sm text-primary-600 hover:text-primary-700 hover:underline">{t('help:popularArticles.propertySafetyRequirements')}</a>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
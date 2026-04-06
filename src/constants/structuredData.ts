import { SITE_URL } from '@/constants/seo';

export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '万万没想到',
    alternateName: 'Unexpectedly',
    url: SITE_URL,
    description: '每日思维提升工具 - 每天5分钟深度思考，锻炼5种思维维度',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    inLanguage: 'zh-CN',
    author: {
      '@type': 'Organization',
      name: '万万没想到',
    },
  };
}

export function getFAQPageSchema(
  questions: { questionText: string; answerText?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.questionText,
      acceptedAnswer: q.answerText
        ? {
            '@type': 'Answer',
            text: q.answerText,
          }
        : undefined,
    })),
  };
}

export function getQAPageSchema(
  questionContent: string,
  answers: string[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: questionContent,
      answerCount: answers.length,
      suggestedAnswer: answers.map((a) => ({
        '@type': 'Answer',
        text: a,
      })),
    },
  };
}

export function getGameSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${SITE_URL}${url}`,
    applicationCategory: 'GameApplication',
    genre: 'Educational',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
  };
}

export function getItemListSchema(
  items: { name: string; url: string; description: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
      description: item.description,
    })),
  };
}

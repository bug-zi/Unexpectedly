import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/constants/seo';
import type { PageSEO } from '@/constants/seo';

interface SEOHelmetProps {
  seo: PageSEO;
}

export function SEOHelmet({ seo }: SEOHelmetProps) {
  const fullTitle = seo.title;
  const canonicalUrl = seo.canonicalPath
    ? `${SITE_URL}${seo.canonicalPath}`
    : undefined;
  const ogImage = DEFAULT_OG_IMAGE;
  const ogType = seo.ogType || 'website';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <meta name="author" content={SITE_NAME} />

      {seo.noindex && <meta name="robots" content="noindex, nofollow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

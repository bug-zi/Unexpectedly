import { useMemo } from 'react';
import { SEOHelmet } from '@/components/seo/SEOHelmet';
import { seoConfig } from '@/constants/seo';
import type { PageSEO } from '@/constants/seo';

interface PageSEOProps {
  /** Route key matching seoConfig, or a direct PageSEO object */
  seo: string | PageSEO;
}

/**
 * Hook to manage per-page SEO meta tags.
 *
 * Usage:
 *   // Static route:
 *   const { SEORender } = usePageSEO({ seo: '/questions' });
 *
 *   // Dynamic route:
 *   const { SEORender } = usePageSEO({ seo: { title: '...', description: '...', keywords: [...] } });
 */
export function usePageSEO({ seo }: PageSEOProps) {
  const pageSEO = useMemo<PageSEO>(() => {
    if (typeof seo === 'string') {
      return seoConfig[seo] || seoConfig['/']!;
    }
    return seo;
  }, [seo]);

  const SEORender = useMemo(
    () => <SEOHelmet seo={pageSEO} />,
    [pageSEO]
  );

  return { SEORender, pageSEO };
}

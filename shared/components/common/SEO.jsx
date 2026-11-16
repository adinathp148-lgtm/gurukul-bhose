import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://gurukulbhose.com/favicon.svg',
  ogType = 'website',
  lang = 'mr'
}) => {
  const defaultTitle = 'गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे | Gurukul Bhose';
  const fullTitle = title ? `${title} | गुरुकुल भोसे` : defaultTitle;
  const defaultDesc = 'गुरुकुल विद्यामंदिर व गुरुकुल जुनियर कॉलेज, भोसे, ता. मिरज, जि. सांगली. ५ वी ते १२ वी सैनिक पॅटर्न निवासी स्कूल व कॉलेज. NDA, Army, Police, NEET, JEE, Scholarship तयारी.';
  const metaDesc = description || defaultDesc;
  const canonical = canonicalUrl || 'https://gurukulbhose.com/';

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

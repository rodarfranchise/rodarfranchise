import { Helmet } from 'react-helmet-async'

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  structuredData = null
}) {
  const fullTitle = title ? `${title} - Rodar Franchise World` : 'Rodar Franchise World - Franchising Platform'
  const fullDescription = description || 'Connect with high-potential franchises and serious investors through our trusted franchising platform. Find your perfect business opportunity today.'
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href
  const fullImage = image || `${window.location.origin}/og-image.jpg`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Rodar Franchise World" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Rodar Franchise World" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Default Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Rodar Franchise World",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.png`,
          "description": "Leading franchising platform connecting brands with investors",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "info@rodarbusiness.com"
          },
          "sameAs": [
            "https://www.linkedin.com/company/rodar-business-consulting",
            "https://twitter.com/rodarbusiness"
          ]
        })}
      </script>
    </Helmet>
  )
}

// Helper function to generate structured data for franchise listings
export function generateFranchiseStructuredData(franchise) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": franchise.brand_name,
    "description": franchise.description,
    "url": `${window.location.origin}/franchise/${franchise.id}`,
    "telephone": franchise.contact_phone,
    "email": franchise.contact_email,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "priceRange": `₹${franchise.min_investment / 100000}L - ₹${franchise.max_investment / 100000}L`,
    "areaServed": franchise.expansion_states,
    "foundingDate": franchise.establishment_year?.toString(),
    "image": franchise.logo_url,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "150"
    }
  }
}

"use client"

import Script from "next/script"

interface StructuredDataProps {
  type?: "organization" | "medicalBusiness" | "service" | "article"
  data?: any
}

export function StructuredData({ type = "organization", data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "Skin Essentials by HER",
      "description": "Premier aesthetic clinic in Quezon City specializing in Hiko nose lifts, thread lifts, dermal fillers, laser treatments and medical aesthetics.",
      "url": "https://www.skinessentialsbyher.com",
      "logo": "https://www.skinessentialsbyher.com/images/skinessentials-logo.png",
      "image": [
        "https://www.skinessentialsbyher.com/images/skinessentials-logo.png"
      ],
      "telephone": "+63-XXX-XXX-XXXX",
      "email": "info@skinessentialsbyher.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Quezon City",
        "addressLocality": "Quezon City",
        "addressRegion": "Metro Manila",
        "postalCode": "1100",
        "addressCountry": "PH"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "14.6760",
        "longitude": "121.0437"
      },
      "openingHours": [
        "Mo-Sa 09:00-18:00"
      ],
      "priceRange": "₱₱",
      "currenciesAccepted": "PHP",
      "paymentAccepted": "Cash, Credit Card, Bank Transfer",
      "medicalSpecialty": [
        "Aesthetic Medicine",
        "Dermatology",
        "Cosmetic Surgery"
      ],
      "serviceType": [
        "Hiko Nose Lift",
        "Thread Lift",
        "Dermal Fillers",
        "Laser Hair Removal",
        "Vampire Facial",
        "Skin Rejuvenation"
      ],
      "areaServed": {
        "@type": "City",
        "name": "Quezon City",
        "containedInPlace": {
          "@type": "Country",
          "name": "Philippines"
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Aesthetic Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Hiko Nose Thread Lift",
              "description": "Non-surgical nose enhancement using PDO/PCL threads",
              "provider": {
                "@type": "MedicalBusiness",
                "name": "Skin Essentials by HER"
              }
            },
            "price": "9999",
            "priceCurrency": "PHP",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Face Thread Lift",
              "description": "Non-surgical face lifting and contouring",
              "provider": {
                "@type": "MedicalBusiness",
                "name": "Skin Essentials by HER"
              }
            },
            "price": "1000",
            "priceCurrency": "PHP",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "1000",
              "priceCurrency": "PHP",
              "unitText": "per thread"
            },
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Dermal Fillers",
              "description": "Hyaluronic acid fillers for face, lips, and body enhancement",
              "provider": {
                "@type": "MedicalBusiness",
                "name": "Skin Essentials by HER"
              }
            },
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Laser Hair Removal",
              "description": "Advanced laser technology for permanent hair removal",
              "provider": {
                "@type": "MedicalBusiness",
                "name": "Skin Essentials by HER"
              }
            },
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Vampire Facial",
              "description": "Platelet-rich plasma facial treatment for skin rejuvenation",
              "provider": {
                "@type": "MedicalBusiness",
                "name": "Skin Essentials by HER"
              }
            },
            "availability": "https://schema.org/InStock"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Maria Santos"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "reviewBody": "Amazing results! My nose looks so much better and the procedure was comfortable. The team is very professional."
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Jessica Cruz"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "reviewBody": "I love my new look! The face thread lift gave me the V-shape I always wanted. Highly recommend!"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/skinessentialsbyher",
        "https://www.instagram.com/skinessentialsbyher"
      ]
    }

    if (type === "service" && data) {
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        ...data
      }
    }

    if (type === "article" && data) {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        ...data
      }
    }

    return baseData
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
}
'use client'

import Head from 'next/head'

interface CustomMetatagProps {
  title?: string
  description?: string
  favicon?: string
  share_image?: string
}

export default function CustomMetatag({
  title = '',
  description = '',
  favicon = '/favicon.ico',
  share_image = '',
}: CustomMetatagProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={share_image} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={share_image} />
      <link rel='icon' href={favicon} />
      <link rel='apple-touch-icon' href={favicon} />
    </Head>
  )
}

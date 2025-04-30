import Image from 'next/image'

export function Logo() {
  return (
    <Image
      src={'/logo.svg'}
      alt='Zapecom Logo'
      width={137}
      height={34}
      priority
    />
  )
}

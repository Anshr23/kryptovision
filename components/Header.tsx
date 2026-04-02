/*
importing a module that depends on `usePathname` into a React Server Component module. 
This API is only available in Client Components. 
To fix, mark the file (or its parent) with the `"use client"` directive.
*/
"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SearchModal } from '@/components/SearchModel'


const Header = () => {
    //to figure out which coin model is active
    const pathname = usePathname();

  return (
    <header>
        <div className="main-container inner">
        <Link href="/">
          <Image src="/logo.svg" alt="CoinPulse logo" width={132} height={40} />
        </Link>

        <nav>
          <Link href="/" className={cn('nav-link', {
            'is-active': pathname === '/',
            'is-home': true
          })}>
          Home</Link>

          <SearchModal initialTrendingCoins={[]} />

          <Link href="/coins" className={cn('nav-link', {
            'is-active': pathname === '/coins',
          })}>All Coins</Link>
        </nav>
        </div>
    </header>
  )
}

export default Header
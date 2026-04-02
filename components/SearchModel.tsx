'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from './ui/button';
import { searchCoins, getTrendingCoins } from '@/lib/coingecko.actions';
import { Search as SearchIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn, formatPercentage } from '@/lib/utils';
import { useDebounce, useKey } from 'react-use';
import useSWR from 'swr';
import { useState } from 'react';

const TRENDING_LIMIT = 8;
const SEARCH_LIMIT = 10;

const SearchItem = ({ coin, onSelect, isActiveName }: SearchItemProps) => {
  const rawData = (coin as any).data;
  let change: number | undefined;

  if (rawData) {
    if (typeof rawData.price_change_percentage_24h === 'number') {
      change = rawData.price_change_percentage_24h;
    } else if (typeof rawData.price_change_percentage_24h?.usd === 'number') {
      change = rawData.price_change_percentage_24h.usd;
    }
  }

  return (
    <CommandItem
      value={`${coin.name} ${coin.symbol} ${coin.id}`}
      onSelect={() => onSelect(coin.id)}
      className='search-item'
    >
      <div className='coin-info'>
        <Image src={coin.thumb} alt={coin.name} width={40} height={40} />

        <div>
          <p className={cn('font-bold', isActiveName && 'text-white')}>
            {coin.name}
          </p>
          <p className='coin-symbol'>{coin.symbol}</p>
        </div>
      </div>

      {change !== undefined && change !== 0 && (
        <div
          className={cn('coin-change', {
            'text-green-500': change > 0,
            'text-red-500': change < 0,
          })}
        >
          {change > 0 ? (
            <TrendingUp size={14} className='text-green-500' />
          ) : (
            <TrendingDown size={14} className='text-red-500' />
          )}
          <span>{formatPercentage(Math.abs(change))}</span>
        </div>
      )}
    </CommandItem>
  );
};

export const SearchModal = ({
  initialTrendingCoins = [],
}: {
  initialTrendingCoins?: TrendingCoin[];
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery.trim());
    },
    300,
    [searchQuery]
  );

  // Fetch trending coins automatically if not provided via props
  const { data: swrTrendingCoins = [] } = useSWR<TrendingCoin[]>(
    open && initialTrendingCoins.length === 0 ? 'modal-trending-coins' : null,
    () => getTrendingCoins(),
    { revalidateOnFocus: false }
  );

  const activeTrendingCoins =
    initialTrendingCoins.length > 0 ? initialTrendingCoins : swrTrendingCoins;

  const { data: searchResults = [], isValidating: isSearching } = useSWR<
    SearchCoin[]
  >(
    debouncedQuery ? ['coin-search', debouncedQuery] : null,
    ([, query]) => searchCoins(query as string),
    {
      revalidateOnFocus: false,
    }
  );

  useKey(
    (event) =>
      event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey),
    (event) => {
      event.preventDefault();
      setOpen((prev) => !prev);
    },
    {},
    [setOpen]
  );

  const handleSelect = (coinId: string) => {
    setOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    router.push(`/coins/${coinId}`);
  };

  const hasQuery = debouncedQuery.length > 0;
  const trendingCoins = activeTrendingCoins.slice(0, TRENDING_LIMIT);
  const showTrending = !hasQuery && trendingCoins.length > 0;

  const isSearchEmpty = !isSearching && !hasQuery && !showTrending;
  const isTrendingListVisible = !isSearching && showTrending;

  const isNoResults = !isSearching && hasQuery && searchResults.length === 0;
  const isResultsVisible = !isSearching && hasQuery && searchResults.length > 0;

  return (
    <div id='search-modal'>
      <Button variant='ghost' onClick={() => setOpen(true)} className='trigger'>
        <SearchIcon size={18} />
        Search
        <kbd className='kbd'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className='dialog'
        data-search-modal
      >
        <div className='cmd-input'>
          <CommandInput
            placeholder='Search for a token by name or symbol...'
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>

        <CommandList className='list custom-scrollbar'>
          {isSearching && <div className='empty'>Searching...</div>}

          {isSearchEmpty && (
            <div className='empty'>Type to search for coins...</div>
          )}

          {isTrendingListVisible && (
            <CommandGroup
              heading={<p className='heading'>Trending Coins</p>}
              className='group'
            >
              {trendingCoins.map(({ item }) => (
                <SearchItem
                  key={item.id}
                  coin={item}
                  onSelect={handleSelect}
                  isActiveName={false}
                />
              ))}
            </CommandGroup>
          )}

          {isNoResults && <CommandEmpty>No coins found.</CommandEmpty>}

          {isResultsVisible && (
            <CommandGroup
              heading={<p className='heading'>Search Results</p>}
              className='group'
            >
              {searchResults.slice(0, SEARCH_LIMIT).map((coin) => (
                <SearchItem
                  key={coin.id}
                  coin={coin}
                  onSelect={handleSelect}
                  isActiveName
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
};
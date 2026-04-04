import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-react';

import FormattedPrice from '@/components/FormattedPrice';

const CoinHeader = ({
  livePriceChangePercentage24h,
  priceChangePercentage30d,
  name,
  image,
  livePrice,
  priceChange24h,
}: LiveCoinHeaderProps) => {
  const isTrendingUp = livePriceChangePercentage24h > 0;
  const isThirtyDayUp = priceChangePercentage30d > 0;
  const isPriceChangeUp = priceChange24h > 0;

  return (
    <div id="coin-header">
      <h3>{name}</h3>

      <div className="info">
        <Image src={image} alt={name} width={77} height={77} />

        <div className="price-row">
          <h1>
            <FormattedPrice amount={livePrice} />
          </h1>
          <Badge className={cn('badge', isTrendingUp ? 'badge-up' : 'badge-down')}>
            {formatPercentage(livePriceChangePercentage24h)}
            {isTrendingUp ? <TrendingUp /> : <TrendingDown />}
            (24h)
          </Badge>
        </div>
      </div>

      <ul className="stats">
        <li>
          <p className="label">Today</p>
          <div className={cn('value', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
            <p>{formatPercentage(livePriceChangePercentage24h)}</p>
            {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
          </div>
        </li>
        <li>
          <p className="label">30 Days</p>
          <div className={cn('value', isThirtyDayUp ? 'text-green-500' : 'text-red-500')}>
            <p>{formatPercentage(priceChangePercentage30d)}</p>
            {isThirtyDayUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
          </div>
        </li>
        <li>
          <p className="label">Price Change (24h)</p>
          <div className={cn('value', isPriceChangeUp ? 'text-green-500' : 'text-red-500')}>
            <FormattedPrice amount={priceChange24h} />
          </div>
        </li>
      </ul>
    </div>
  );
};
export default CoinHeader;
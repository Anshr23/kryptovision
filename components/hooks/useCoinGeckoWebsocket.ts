'use client';

import { useEffect, useRef, useState } from 'react';

const CG_WS_URL = process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL;
const CG_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export const useCoinGeckoWebSocket = ({
  coinId,
  poolId,
  liveInterval = '1s',
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isWsReady, setIsWsReady] = useState(false);
  const [useBinanceFallback, setUseBinanceFallback] = useState(false);

  useEffect(() => {
    // Try CoinGecko Pro WebSocket ONLY if explicit key is provided and fallback not triggered
    if (CG_WS_URL && CG_API_KEY && CG_API_KEY.trim() !== '' && !useBinanceFallback) {
      const wsUrl = `${CG_WS_URL}?x_cg_pro_api_key=${CG_API_KEY}`;
      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const send = (payload: Record<string, unknown>) => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
          }
        };

        ws.onopen = () => setIsWsReady(true);
        ws.onclose = () => setIsWsReady(false);
        ws.onerror = () => {
          setIsWsReady(false);
          setUseBinanceFallback(true);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const msg: WebSocketMessage = JSON.parse(event.data);

            if (msg.type === 'ping') {
              send({ type: 'pong' });
              return;
            }
            if (msg.type === 'confirm_subscription') {
              const { channel } = JSON.parse(msg?.identifier ?? '{}');
              subscribed.current.add(channel);
            }
            if (msg.c === 'C1') {
              setPrice({
                usd: msg.p ?? 0,
                coin: msg.i,
                price: msg.p,
                change24h: msg.pp,
                marketCap: msg.m,
                volume24h: msg.v,
                timestamp: msg.t,
              });
            }
            if (msg.c === 'G2') {
              const newTrade: Trade = {
                price: msg.pu,
                value: msg.vo,
                timestamp: msg.t ?? 0,
                type: msg.ty,
                amount: msg.to,
              };
              setTrades((prev) => [newTrade, ...prev].slice(0, 7));
            }
            if (msg.ch === 'G3') {
              const timestamp = msg.t ?? 0;
              const candle: OHLCData = [
                timestamp,
                Number(msg.o ?? 0),
                Number(msg.h ?? 0),
                Number(msg.l ?? 0),
                Number(msg.c ?? 0),
              ];
              setOhlcv(candle);
            }
          } catch (err) {
            console.error('CoinGecko WS parse error:', err);
          }
        };

        return () => {
          ws?.close();
        };
      } catch {
        setUseBinanceFallback(true);
      }
    }

    // FREE FALLBACK: Binance Public WebSocket (No API key required!)
    const cleanCoinId = coinId ? coinId.toLowerCase().replace(/[^a-z0-9]/g, '') : 'btc';
    let symbol = `${cleanCoinId}usdt`;
    if (cleanCoinId === 'bitcoin') symbol = 'btcusdt';
    else if (cleanCoinId === 'ethereum') symbol = 'ethusdt';
    else if (cleanCoinId === 'solana') symbol = 'solusdt';
    else if (cleanCoinId === 'ripple') symbol = 'xrpusdt';
    else if (cleanCoinId === 'cardano') symbol = 'adausdt';
    else if (cleanCoinId === 'dogecoin') symbol = 'dogeusdt';

    const klineInterval = liveInterval === '1s' ? '1s' : '1m';
    const binanceWsUrl = `wss://stream.binance.com:9443/stream?streams=${symbol}@ticker/${symbol}@trade/${symbol}@kline_${klineInterval}`;

    let binanceWs: WebSocket | null = null;
    try {
      binanceWs = new WebSocket(binanceWsUrl);
      wsRef.current = binanceWs;

      binanceWs.onopen = () => setIsWsReady(true);
      binanceWs.onclose = () => setIsWsReady(false);
      binanceWs.onerror = () => setIsWsReady(false);

      binanceWs.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          const stream: string = payload.stream ?? '';
          const data = payload.data;
          if (!data) return;

          if (stream.endsWith('@ticker')) {
            const currentPrice = parseFloat(data.c ?? '0');
            const change24h = parseFloat(data.P ?? '0');
            const volume = parseFloat(data.v ?? '0');
            setPrice({
              usd: currentPrice,
              price: currentPrice,
              change24h,
              volume24h: volume,
              timestamp: data.E,
            });
          } else if (stream.endsWith('@trade')) {
            const tradePrice = parseFloat(data.p ?? '0');
            const amount = parseFloat(data.q ?? '0');
            const newTrade: Trade = {
              price: tradePrice,
              amount,
              value: tradePrice * amount,
              timestamp: data.T ?? Date.now(),
              type: data.m ? 's' : 'b',
            };
            setTrades((prev) => [newTrade, ...prev].slice(0, 7));
          } else if (stream.includes('@kline_')) {
            const k = data.k;
            if (k) {
              const candle: OHLCData = [
                k.t,
                parseFloat(k.o),
                parseFloat(k.h),
                parseFloat(k.l),
                parseFloat(k.c),
              ];
              setOhlcv(candle);
            }
          }
        } catch (err) {
          console.error('Binance WS parse error:', err);
        }
      };
    } catch (err) {
      console.error('Failed to connect to Binance WS:', err);
    }

    return () => {
      if (binanceWs) binanceWs.close();
    };
  }, [coinId, liveInterval, useBinanceFallback]);

  // Handle CoinGecko subscriptions if using CG WS
  useEffect(() => {
    if (!isWsReady || !CG_WS_URL || !CG_API_KEY || useBinanceFallback) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: 'unsubscribe',
          identifier: JSON.stringify({ channel }),
        });
      });
      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;
      send({ command: 'subscribe', identifier: JSON.stringify({ channel }) });
      if (data) {
        send({
          command: 'message',
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    queueMicrotask(() => {
      setPrice(null);
      setTrades([]);
      setOhlcv(null);
      unsubscribeAll();
      subscribe('CGSimplePrice', { coin_id: [coinId], action: 'set_tokens' });
    });

    const poolAddress = poolId?.replace('_', ':') ?? '';
    if (poolAddress) {
      subscribe('OnchainTrade', {
        'network_id:pool_addresses': [poolAddress],
        action: 'set_pools',
      });
      subscribe('OnchainOHLCV', {
        'network_id:pool_addresses': [poolAddress],
        interval: liveInterval,
        action: 'set_pools',
      });
    }
  }, [coinId, poolId, isWsReady, liveInterval, useBinanceFallback]);

  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  };
};
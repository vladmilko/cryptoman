const API_KEY = '27d1673eb55a55bde684f3dcd640823ce27b8b741b3fce0458808b92978efc37';
const RIGHT_INDEX = '5';

const tickers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
);

socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: curTicker, PRICE: newPrice } = JSON.parse(e.data);

  if (type !== RIGHT_INDEX || newPrice === undefined) return;

  const handlers = tickers.get(curTicker) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendToWs(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener('open', () => {
    socket.send(stringifiedMessage);
  },
  { once: true });
}

function subcribeToTickerByWs(ticker) {
  sendToWs({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unSubcribeToTickerByWs(ticker) {
  sendToWs({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

const subscribeToTicker = (ticker, cb) => {
  const subcribes = tickers.get(ticker) || [];
  tickers.set(ticker, [...subcribes, cb]);
  subcribeToTickerByWs(ticker);
};

const unSubscribeFromTicker = (ticker) => {
  tickers.delete(ticker);
  unSubcribeToTickerByWs(tickers);
};

export { subscribeToTicker, unSubscribeFromTicker };

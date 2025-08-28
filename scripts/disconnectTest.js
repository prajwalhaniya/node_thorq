import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected (disconnect)');

  // Subscribe to topic "orders"
  ws.send(JSON.stringify({ op: 'subscribe', topic: 'orders' }));

  // Simulate publishing 10 messages very quickly (filling the queue)
  setTimeout(() => {
    for (let i = 1; i <= 150; i++) {
      ws.send(JSON.stringify({
        op: 'publish',
        topic: 'orders',
        data: { orderId: i, status: 'processing' }
      }));
    }
  }, 1000);
};

ws.onmessage = (event) => {
  console.log('Received (disconnect):', event.data);
};

ws.onclose = () => {
  console.log('Disconnected due to SLOW_CONSUMER');
};

ws.onerror = (error) => {
  console.error('WebSocket error (disconnect):', error);
};

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected (drop_oldest)');

  // Subscribe to topic "orders"
  ws.send(JSON.stringify({ op: 'subscribe', topic: 'orders' }));

  // Simulate publishing 10 messages very quickly (filling the queue)
  setTimeout(() => {
    for (let i = 1; i <= 150; i++) {
      ws.send(JSON.stringify({
        op: 'publish',
        topic: 'orders',
        data: { orderId: i, status: 'created' }
      }));
    }
  }, 1000);
};

ws.onmessage = (event) => {
  console.log('Received (drop_oldest):', event.data);
};

ws.onclose = () => {
  console.log('Disconnected (drop_oldest)');
};

ws.onerror = (error) => {
  console.error('WebSocket error (drop_oldest):', error);
};

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected');

  // Subscribe to a topic
  ws.send(JSON.stringify({ op: 'subscribe', topic: 'orders' }));

//   Publish after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      op: 'publish',
      topic: 'orders',
      data: { orderId: 123, status: 'confirmed' }
    }));
  }, 2000);
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onclose = () => {
  console.log('Disconnected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
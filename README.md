# node_thorq

# APIs

### Get the list of topics
`GET`: {{thorqUrl}}/app/topics

### Add/Create a topic
`POST`: {{thorqUrl}}/app/topics

### Subscribing & Publishing the message

As you need to connect to a websocket you can follow the below instructions for it.

```
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
```
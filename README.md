# node_thorq

A pub/sub system built using node.js and TypeScript.

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


## Setup

Dockerfile is attached with the repository. After cloning just run the below commands

`Using docker`

docker build -t node_thorq .

docker run -p 3000:3000 my-node-app


## Running locally via yarn

Run `Yarn` in the root directory of the project.

Then `yarn start-server`

You will have the project running in localhost:3000

> I have been building something similar in rust. You can checkout the project [here](https://github.com/one8-labs/thorq)


console.log('hello')
const {PubSub} = require('@google-cloud/pubsub');


function main(subscriptionName = 'elodie', timeout = 60) {
   
    // Creates a client; cache this for further use
    const pubSubClient = new PubSub();
  
    function listenForMessages() {
      // References an existing subscription
      const subscription = pubSubClient.subscription(subscriptionName);
  
      // Create an event handler to handle messages
      let messageCount = 0;
      const messageHandler = message => {
        console.log(`Received message ${message.id}:`);
        console.log(`\tData: ${message.data}`);
        console.log(`\tAttributes: ${message.attributes}`);
        messageCount += 1;
  
        zipPhotos(message.data);

        // "Ack" (acknowledge receipt of) the message
        message.ack();

        

      };
  
      // Listen for new messages until timeout is hit
      subscription.on('message', messageHandler);
  
      setTimeout(() => {
        subscription.removeListener('message', messageHandler);
        console.log(`${messageCount} message(s) received.`);
      }, timeout * 1000);
    }
  
    listenForMessages();
    
}

function zipPhotos(data){
console.log(data);
}
  
main();

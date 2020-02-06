const {PubSub} = require('@google-cloud/pubsub');
const request = require('request');
const ZipStream = require('zip-stream');
const express = require('express');
const photoModel = require('./photo_model');


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

        const decodedMessage = JSON.parse(message.data);
        console.log(decodedMessage);
  
        return photoModel
        .returnFlickrPhotosPackage(decodedMessage.tags, "all")
        .then(items => {
            console.log(items);
            zipPhotos(items);
        })
        .catch(error => {
            console.log("error");
        });

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

function zipPhotos(items){

    var zip = new ZipStream()
    zip.pipe();

    var queue = items;

    function addNextFile() {
        var elem = queue.shift()
        var stream = request(elem.url)
        zip.entry(stream, { name: elem.name }, err => {
            if(err)
                throw err;
            if(queue.length > 0)
                addNextFile()
            else
                zip.finalize()
        })
    }

    addNextFile()
    console.log(zip);

}
  
main();

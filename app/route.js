const formValidator = require('./form_validator');
const photoModel = require('./photo_model');
const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');

function route(app) {
  app.get('/', (req, res) => {
    const tags = req.query.tags;
    const tagmode = req.query.tagmode;

    const ejsLocalVariables = {
      tagsParameter: tags || '',
      tagmodeParameter: tagmode || '',
      photos: [],
      searchResults: false,
      invalidParameters: false
    };

    // if no input params are passed in then render the view with out querying the api
    if (!tags && !tagmode) {
      return res.render('index', ejsLocalVariables);
    }

    // validate query parameters
    if (!formValidator.hasValidFlickrAPIParams(tags, tagmode)) {
      ejsLocalVariables.invalidParameters = true;
      return res.render('index', ejsLocalVariables);
    }

    // get photos from flickr public feed api
    return photoModel
      .getFlickrPhotos(tags, tagmode)
      .then(photos => {
        ejsLocalVariables.photos = photos;
        ejsLocalVariables.searchResults = true;
        return res.render('index', ejsLocalVariables);
      })
      .catch(error => {
        return res.status(500).send({ error });
      });
  });

  app.get('/zip', async(req, res) => {
    const tags = req.query.tags;
  
    function quickstart(
      projectId = 'gobelin', // Your Google Cloud Platform project ID
      topicName = 'elodie', // Name for the new topic to create
      data = JSON.stringify({tags: tags})
    ) {
      console.log(data);
      // Instantiates a client
      const pubSubClient = new PubSub({projectId});

      async function publishMessage() {
            
        // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
        const dataBuffer = Buffer.from(data);
    
        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
      }
    
      publishMessage().catch(console.error);
      
    }
    quickstart();


  });

}

module.exports = route;

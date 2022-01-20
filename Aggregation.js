const {
  MongoClient
} = require('mongodb');
async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/drivers/node/ for more details
   */
  const uri = "mongodb+srv://baoto:%40BaoTo97@clusterbt.fnvsk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

  /**
   * The Mongo Client you will use to interact with your database
   * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
   * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
   * pass option { useUnifiedTopology: true } to the MongoClient constructor.
   * const client =  new MongoClient(uri, {useUnifiedTopology: true})
   */
  const client = new MongoClient(uri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await printCheapestSuburbs(client, 5);
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
}
main().catch(console.error);
// Add functions that make DB calls here
async function printCheapestSuburbs(client, maxNumberToPrint) {
  const pipeline = [
       {
        '$group': {
          '_id': '$name',
        'averagePrice': {
          '$avg': '$price'
        }
      }
    },
    {
      '$sort': {
        'averagePrice': -1
      }
    }, {
      '$limit': maxNumberToPrint
    }
];

const aggCursor = client.db("BaoToDB")
  .collection("fruits")
  .aggregate(pipeline);
await aggCursor.forEach(airbnbListing => {
  console.log(`${airbnbListing._id}: ${airbnbListing.averagePrice}`);
});
}

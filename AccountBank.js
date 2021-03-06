const {
  MongoClient
} = require('mongodb');

/**
 * This script creates 3 new users in the users collection in the sample_airbnb database.
 * The users collection does not need to exist before running this script.
 * This script also creates a unique index on the email field in the users collection.
 *
 * You will see "duplicate key" errors if you attempt to run this script more than once
 * without dropping the documents in the users collection, because the unique index will
 * not allow you to insert more than one document into the collection with the same email address.
 */

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
    // await createAccountBank(client,  [{
    //           name: 'A',
    //           balance: 50
    //         },
    //         {
    //           name: 'B',
    //           balance: 10
    //         }
    //       ]);

      await transfer(client, 'A', 'B', 40);



  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
}

main().catch(console.error);

async function createAccountBank(client, acount) {
  const result = await client.db("BaoToDB").collection('Account').insertMany(acount);
  console.log(`${result.insertedCount} new acount(s) created with the following id(s):`);
  console.log(result.insertedIds);

}

async function transfer(client, from, to, amount) {
  const session = client.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: {
      level: 'local'
    },
    writeConcern: {
      w: 'majority'
    }
  };
  try {
    const transactionResults = await session.withTransaction(async () => {
      const opts = { session, returnOriginal: false };
      const A = await client.db("BaoToDB").collection('Account').
        findOne({ name: from });
      console.log('S??? d?? ban ?????u s??? kh??ch hi???n c??', A.balance)
      if (A.balance < 0) {
        console.log(await Client.db("BaoToDB").collection('Account').findOne({name: from}))
        throw new Error('Kh??ng ????? ti???n: ' + (A.balance + amount));
      }else{
        if(A.balance<amount){
          console.log("S??? ti???n g???i l?? "+ amount +" ????ng .L???n h??n s??? d?? trong t??i kho???n n??n kh??ng ????? chuy???n kho???n");
          await session.endSession();
        }
        else{
            const AA = await client.db("BaoToDB").collection('Account').
            findOneAndUpdate({ name: from }, { $inc: { balance: -amount } }, opts).
            then(res => res.value);
            const B = await client.db("BaoToDB").collection('Account').
              findOneAndUpdate({ name: to }, { $inc: { balance: amount } }, opts).
              then(res => res.value);
            console.log("Quy kh??ch ???? chuy???n kho???n "+ amount+" ?????ng");
            await session.commitTransaction();
            return {
              from: AA,
              to: B
            };
        }
      }


    }, transactionOptions);
      await kiemTraSoDu(client,from);
  } catch (e) {
    // N???u x???y ra l???i, h??y h???y b??? t???t c??? c??c giao d???ch v?? quay tr??? l???i tr?????c khi s???a ?????i
    console.log('Loi ne');
    await session.abortTransaction();

    throw error; // catch error
  } finally {
    await session.endSession();
  }

}
async function kiemTraSoDu(client,from){
  const result = await client.db("BaoToDB").collection('Account').findOne({name:from});
  console.log("S??? d?? :"+result.balance);
}

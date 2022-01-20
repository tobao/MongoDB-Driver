const {
  MongoClient
} = require('mongodb');
async function main() {
  const url = "mongodb+srv://baoto:%40BaoTo97@clusterbt.fnvsk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(url);
  try {
    await client.connect();
    // await listDatabases(client);

    // await createListing(client, {
    //   name: "Apple",
    //   score: 8,
    //   review: "Great"
    // })

    // await createMultipleListing(client,[
    //   {
    //     name: "Banana",
    //     score: 6,
    //     review: "Not Bad and Not Good"
    //   },
    //   {
    //     name: "Orange",
    //     score: 9,
    //     review: "Oh Good"
    //   },
    //   {
    //     name: "Peach",
    //     score: 3,
    //     review: "Bad!"
    //   },
    //   {
    //     name: "Starfruit",
    //     score: 4,
    //     review: "So Sour"}
    // ])

    // await findOneListingByName(client, "Peach");

    await findArray(client);

    // await findScore(client, {
    //   minimumScore: 5,
    //   maximumNumberResult: 2
    // })

    // await updateListingByName(client, "Banana", { score: 5, review: "Normal!" });

    // await upsertListingByName(client, "Longan", {
    //   name: "Longan",
    //   score: 10,
    //   review: "I've never eaten such delicious fruit before!"
    // });
    //
    // await upsertListingByName(client, "Coconut", {
    //   name: "Coconut",
    //   score: 7
    // });
    //
    // await upsertListingByName(client, "Lychee", {
    //   name: "Lychee",
    //   score: 7.5
    // });
    //
    // await upsertListingByName(client, "Mango", {
    //   name: "Mango",
    //   score: 7
    // });

    // await updateAllListingsToHaveReview(client);

    // await updateAllListingsToHaveLastReview(client);

    // await deleteListingByName(client, "Coconut");

    // await deleteListingsReviewBeforeDate(client, new Date("2022-02-01"));

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main().catch(console.error);

//hàm xuất danh dách database
async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Database:");
  databasesList.databases.forEach(db => {
    console.log(`- ${db.name}`);
  })
}

//hàm tạo
async function createListing(client, newListing) {
  const result = await client.db('BaoToDB').collection('fruits').insertOne(newListing);
  console.log(`New listing created with following id: ${result.insertedId}`);
}

async function createMultipleListing(client, newListings) {
  const result = await client.db('BaoToDB').collection('fruits').insertMany(newListings);
  console.log(`${result.insertedCount} new listing created with the following id(s): `);
  console.log(result.insertedIds);
}

//hàm truy vấn
async function findOneListingByName(client, nameOfListing) {
  const result = await client.db('BaoToDB').collection('fruits').findOne({
    name: nameOfListing
  });
  if (result) {
    console.log(`Found a listing in the collection with the name: '${nameOfListing}'`);
    console.log(result);
  } else {
    console.log(` No listenings found with the name '${nameOfListing}'`);
  }
}

async function findArray(client) {
  const result = await client.db('BaoToDB').collection('fruits').find({}).toArray();
  console.log(result);
}

async function findScore(client, {
  minimumScore = 0,
  maximumNumberResult = Number.MAX_SAFE_INTEGER
} = {}) {
  const cursor = client.db('BaoToDB').collection('fruits').find({
      score: {
        $gte: minimumScore
      }
    }).sort({
      last_review: -1
    })
    .limit(maximumNumberResult);
  const results = await cursor.toArray();
  if (results.length > 0) {
    console.log(`Found listing(s) with at least ${minimumScore} score:`);
    results.forEach((result, i) => {
      date = new Date(result.last_review).toDateString();
      console.log();
      console.log(`${i + 1}. name: ${result.name}`);
      console.log(`   _id: ${result._id}`);
      console.log(`   score: ${result.score}`);
      // console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
    });
  } else {
    console.log(`No listings found with at least ${minimumScore} score`);
  }
}

//hàm update
async function updateListingByName(client, nameOfListing, updatedListing) {
  const result = await client.db('BaoToDB').collection('fruits').updateOne({
    name: nameOfListing
  }, {
    $set: updatedListing
  });
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
  const result = await client.db("BaoToDB").collection("fruits").updateOne({
    name: nameOfListing
  }, {
    $set: updatedListing
  }, {
    upsert: true
  });
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);

  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId._id}`);
  } else {
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
  }
}

async function updateAllListingsToHaveReview(client) {
  const result = await client.db("BaoToDB").collection("fruits")
    .updateMany({
      review: {
        $exists: false
      }
    }, {
      $set: {
        review: "Unknown"
      }
    });
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function updateAllListingsToHaveLastReview(client) {
  const result = await client.db("BaoToDB").collection("fruits")
    .updateMany({
      last_review: {
        $exists: false
      }
    }, {
      $set: {
        last_review: new Date("2022-01-01")
      }
    });
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//hàm xóa
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("BaoToDB").collection("fruits")
            .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingsReviewBeforeDate(client, date) {
    const result = await client.db("BaoToDB").collection("fruits")
        .deleteMany({ "last_review": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

// const uri = "mongodb+srv://baoto:@BaoTo97@clusterbt.fnvsk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("Connected successfully to server")
//   client.close();
// });

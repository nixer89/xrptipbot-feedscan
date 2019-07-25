import * as db from './db';
import * as feedScan from './feedScan';

let feedURL = 'https://www.xrptipbot.com/json/feed';
let ilpFeedURL = 'https://www.xrptipbot.com/json/ilp-feed';

// Run the server!
const start = async () => {
    console.log("starting feedscan");
    try {
      //init db
      let isNewCollectionTips = await db.initTipDB();
      let isNewCollectionILP = await db.initILPDB();
      let isNewCollectionStandard = await db.initTipDBStandarized();

      //init feed and standarized feed
      let tipsFeed = new feedScan.FeedScan(await db.getNewDbModelTips(), feedURL, await db.getNewDbModelTipsStandarized());
      await tipsFeed.initFeed(isNewCollectionTips||isNewCollectionStandard, true, true);

      //init ILP feed
      let ilpFeed = new feedScan.FeedScan(await db.getNewDbModelILP(), ilpFeedURL);
      await ilpFeed.initFeed(isNewCollectionILP, false);
    } catch (err) {
      process.exit(1);
    }
}

start();
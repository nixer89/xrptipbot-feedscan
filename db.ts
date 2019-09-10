import * as mongoose from 'mongoose'
import { CommandCursor } from 'mongodb';
import consoleStamp = require("console-stamp");

consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

let connection: mongoose.Connection;
let tipCollectionName:string = "FeedCollection";
let tipCollectionNameStandarized:string = "FeedCollectionStandarized";
let ilpCollectionName:string = "ILPFeedCollection";
let ilpCollectionNameStandarized:string = "ILPFeedCollectionStandarized";
var Schema = mongoose.Schema;
let dbIp = process.env.DB_IP || "127.0.0.1"

var tipBotSchema:mongoose.Schema = new Schema({
    id: {type: String, required: true},
    moment: String,
    type: String,
    xrp: Number,
    network: String,
    user: String,
    to: String,
    user_network: String,
    to_network: String,
    user_id: String,
    to_id: String,
    context: String,
    momentAsDate: Date
});

var tipBotSchemaILP:mongoose.Schema = new Schema({
    id: {type: String, required: true},
    moment: String,
    type: String,
    network: String,
    user: String,
    user_network: String,
    user_id: String,
    amount: Number,
    momentAsDate: Date
});

tipBotSchema = tipBotSchema.index({id: -1}, {unique: true});
tipBotSchema = tipBotSchema.index({momentAsDate: -1});
tipBotSchema = tipBotSchema.index({xrp: 1});
tipBotSchema = tipBotSchema.index({user_id: 1});
tipBotSchema = tipBotSchema.index({to_id: 1});
tipBotSchema = tipBotSchema.index({type: 1, network: 1});
tipBotSchema = tipBotSchema.index({user: "text", to: "text"});

tipBotSchemaILP = tipBotSchemaILP.index({id: -1}, {unique: true});
tipBotSchemaILP = tipBotSchemaILP.index({momentAsDate: -1});
tipBotSchemaILP = tipBotSchemaILP.index({xrp: 1});
tipBotSchemaILP = tipBotSchemaILP.index({user_id: 1});
tipBotSchemaILP = tipBotSchemaILP.index({to_id: 1});
tipBotSchemaILP = tipBotSchemaILP.index({type: 1, network: 1});
tipBotSchemaILP = tipBotSchemaILP.index({user: "text", to: "text"});


export function initTipDB(): Promise<boolean> {
    return initDB(tipCollectionName);
}

export function initTipDBStandarized(): Promise<boolean> {
    return initDB(tipCollectionNameStandarized);
}

export function initILPDB(): Promise<boolean> {
    return initDB(ilpCollectionName);
}

export function initILPDBStandarized(): Promise<boolean> {
    return initDB(ilpCollectionNameStandarized);
}

async function initDB(collectionName: string): Promise<boolean> {
    console.log("[DB]: connecting to mongo db with collection: " + collectionName);
    await mongoose.connect('mongodb://'+dbIp+':27017/'+collectionName, { useCreateIndex: true, useNewUrlParser: true});
    connection = mongoose.connection;

    connection.on('open', ()=>{console.log("[DB]: Connection to MongoDB established")});
    connection.on('error', ()=>{console.log("[DB]: Connection to MongoDB could NOT be established")});

    let newCollection = true;    

    let collections:CommandCursor = await mongoose.connection.db.listCollections({name: collectionName});
    newCollection = !(await collections.hasNext());
    
    await mongoose.disconnect();

    return newCollection;
}

export function getNewDbModelTips(): Promise<mongoose.Model<any>> {
    return getNewDbModel(tipCollectionName, tipBotSchema);
}

export function getNewDbModelTipsStandarized(): Promise<mongoose.Model<any>> {
    return getNewDbModel(tipCollectionNameStandarized, tipBotSchema);
}

export function getNewDbModelILP(): Promise<mongoose.Model<any>> {
    return getNewDbModel(ilpCollectionName, tipBotSchemaILP);
}

export function getNewDbModelILPStandarized(): Promise<mongoose.Model<any>> {
    return getNewDbModel(ilpCollectionNameStandarized, tipBotSchemaILP);
}

async function getNewDbModel(collectionName: string, schema: mongoose.Schema): Promise<mongoose.Model<any>> {
    console.log("[DB]: connecting to mongo db with collection: " + collectionName +" and an schema");
    let connection:mongoose.Connection = await mongoose.createConnection('mongodb://'+dbIp+':27017/'+collectionName, { useCreateIndex: true, useNewUrlParser: true});
    connection.on('open', ()=>{console.log("[DB]: Connection to MongoDB established")});
    connection.on('error', ()=>{console.log("[DB]: Connection to MongoDB could NOT be established")});

    if(connection)
        return connection.model('xrpTipBotApiModel', schema, collectionName);
    else
        return null;
}
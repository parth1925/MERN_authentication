import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "MERNAuthetication",
        })
        console.log("MongoDb connected");

    } catch (error) {
        console.log("failed to connect");

    }
};

export default connectDb;
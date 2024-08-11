import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        console.log("Mongo__url", process.env.MONGO_URL);
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default ConnectDB;

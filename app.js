import Express from "express";
import logger from "./winston.js"
const app = Express();
const port = process.env.PORT || 3000;
logger.error("This is an error log")
logger.warn("This is an error log")
app.listen(port, () => {
    logger.log('info', `App running on port ${ port }`);
})
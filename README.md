## Logging Definition

- Logging is the process of recording application actions, activities and state to a secondary interface.

- Logging is the process of recording application activities into log files. Data saved in a log file are called logs and are usually identified with the `.log` extension (some people use other extension preferences)

In this article, you will discover how to use - [Winston](https://www.npmjs.com/package/winston) to log your application activities into files instead of logging to the console.

## Why Do you need to Log Data

Why do we need to Log application activities you may ask;
Well, logging;

- Helps us know when something or an issue occurs with our app, especially when it's in production mode.
- Helps monitor and Keep track of your system activities.
- Helps persist data so you can view this data for analysis later

### Let’s begin with our Winston Logger

In this tutorial, we will need an ExpressJS application running on our machine and one prerequsite to use express is to have [Node](https://nodejs.org/en/) installed on your machine.

> If you do not want to go through the entire process, you can [clone this repository](https://github.com/jobizil/winston-tut) for the complete code.

### Let's Dive In

- Open up your terminal on your desktop or preferred folder location.

  > I have a special folder where I keep all tutorial related files so I’ll open it up on my terminal.

  Within your folder dir, create a new folder, I'll call mine `winston-tut` and initialize node with either yarn or npm `(I’ll be using yarn)`.

```
mkdir winston-tut
cd winston-tut
yarn init -y
```

Open it up with your preferred code editor `( I’ll be using code-insiders )`.

```
code-insider ./
```

After that, we’ll have to install express, winston and dotenv

```
 yarn add express winston dotenv
```

Also, we’ll need to install - [nodemon](https://www.npmjs.com/package/nodemon) as a dev dependency, so as to be able to restart our server automatically in dev mode.

```
yarn add -D nodemon
```

Also, you will have to modify your `package.json` file to be able to use [ECMAScript 6 modulejs](https://nodejs.org/api/esm.html#esm_modules_ecmascript_modules).

> Ensure your node is version 14 or higher. You can check for the version of your node on your terminal with the command `node -v` or `node --version`. You can download the current node [here](https://nodejs.org/en/).

- Open your `package.json` and simply add the following;

```
 “type”:”module”,
 “scripts”:{
   “start:dev”:nodemon app”,
   “start”:”node app”
   },
```

- Create a new file from your terminal in your working dir with `touch app.js` where you'll spin up your express server.
- Add the following code to your `app.js`

```
import Express from "express";
const app = Express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${ port }`);
})
```

Run `yarn start:dev` to start the server in dev mode.

- Create another file `winston.js`. This is where we'll write our code for the logger.

  ```
  import winston from 'winston'
  const { transports, format, createLogger } = winston
  const { combine, printf } = format
  ```

  > For your reference
  >
  > - Winston requires at least one transport to create a log. A transport is where the log is saved. Read more on [transports](https://github.com/winstonjs/winston#transports)
  > - This allows flexibility when writing your own transports in case you wish to include a default format with your transport. Read more on [format](https://github.com/winstonjs/winston#formats)

 <!-- -->

- Since we want our logger to be in a readable human format, we'll have to do some custom winston configuration

```
// ..
// ..
const customLog = printf(({ level, message }) => {
    return `Level:[${ level }] LogTime: [${ logTime }] Message:-[${ message }]`
})

const logger = new createLogger({
    format: combine(customLog), transports: [
       new transports.File({
            level: 'info',
            dirname: 'logs',
            json: true,
            handleExceptions: true,
            filename: `combined.log`
        })
    ], exitOnError: false
})

export default logger
```

> The Logger configuration above logs to a file. We’ll add a transport array to the log configuration object.
>
> Later in this guide, we’ll see how we can log error and other log levels to a file and to the console too.

- Back to our `app.js`, let's import our logger

```
import logger from "./winston.js"
//...
// ...

app.listen(port, () => {
    logger.log('info', `App running on port ${ port }`);
})
```

From the code above example:

- Every time the server starts or restarts, Winston will record a log to the combined.log file.

- Now let's log error level into it's own file for readability and also do some personalization in terms of logging with date and timestamps.

  - Back to our `winston.js` file we'll write a custom logic.

```
// ...
// ...

// Create a log time
const logTime = new Date().toLocaleDateString()
const customLog = printf(({ level, message }) => {
    return `Level:[${ level }] LogTime: [${ logTime }] Message:-[${ message }]`
})

// Custom date for logging files with date of occurance
const date = new Date()
const newdate = `${ date.getDate() }-${ date.getMonth() }-${ date.getFullYear() }`

const options = {
    info: {
        level: 'info',
        dirname: 'logs/combibned',
        json: true,
        handleExceptions: true,
        datePattern: 'YYYY-MM-DD-HH',
        filename: `combined-${ newdate }.log`,
    },
    error: {
        level: 'error',
        dirname: 'logs/error',
        json: true,
        handleExceptions: true,
        filename: `error-${ newdate }.log`,
    },
    console: {
        level: 'debug',
        json: false,
        handleExceptions: true,
        colorize: true,
    },
}

const logger = new createLogger({
    format: combine(customLog), transports: [
        new transports.File(options.info),
        new transports.File(options.error),
        new transports.Console(options.console)
    ], exitOnError: false
})

```

- Back to our `app.js`, let's import our logger

```
import logger from "./winston.js"
//...
// ...

logger.error("This is an error log")
logger.warn("This is a warn log")
logger.debug("This is logged to the Console only ")

app.listen(port, () => {
    logger.log('info', `App running on port ${ port }`);
})
```

### Logging to database

- With winston, it is very easy to log application activities to a database.
  > I will be logging into a mongo database in this section. I will write on how to do so in other databases soon.
  >
  > ### Let's begin

We'll need to install a dependency [winston-mongo](https://www.npmjs.com/package/winston-mongo)

```
yarn add winston-mongo
```

- Back to our `winston.js` file we'll just add few lines of code to our existing logic.

```
import ("winston-mongodb");

// ..
// ..
// ..

const options = {
dbinfo: {
    level: "info",
    collection: "deliveryLog",
    db: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    maxsize: 52428800, // 50MB
  },

// ..
// ..

}

const logger = new createLogger({
    format: combine(customLog), transports: [
      // ..
      // ..
      new transports.MongoDB(options.dbinfo),
    ], exitOnError: false
})

```

#### And that's all for logging with winston. You can visit [winston's](https://github.com/winstonjs/winston#readme) github repo for more.

<!--  -->

### You can view complete code [here](https://github.com/jobizil/winston-tut).

### Finally

- Logging is the best approach to adopt for your production application. Also there are other standard (premium) logging tools out there.

- Always remember logging is best to be in a readable human format as it helps debugging easier.

You might ask when to log, I'll say it's best to log when your app starts and it's best to log into a seperate database when your app hits production.

Some of the standard logging instances include:

- Logging when there is an error or the app encounters unexpected exceptions.
- Logging when a system event takes place.
- Logging request and responses

  [section.io](https://www.section.io/engineering-education/logging-with-winston/)

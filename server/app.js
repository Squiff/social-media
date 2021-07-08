const express = require('express');
const postRouter = require('./routes/posts');
const authRouter = require('./routes/auth');

/*------ EXPRESS ------*/
const app = express();

/*--- MIDDLEWARES ---*/
app.use(express.json());

/*------ ROUTES ------*/
app.use('/api', authRouter);
app.use('/api/posts', postRouter);

/*---- Start Server -----*/
const port = 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

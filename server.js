/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.static('dist'));
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

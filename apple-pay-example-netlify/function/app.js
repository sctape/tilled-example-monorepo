const express = require('express');
const axios = require('axios');
const app = express();
const serverless = require('serverless-http');
const router = express.Router();
const tilledSecretApiKey = 'Add Your Key Here'

router.get('/secret/:id', (req, res) => {
    const tilledAccountId = req.params.id
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tilledSecretApiKey,
        'Tilled-Account': tilledAccountId,
    }

    axios.post('https://sandbox-api.tilled.com/v1/payment-intents',
        {
            amount: 500,
            currency: 'usd',
            payment_method_types: ['card','ach_debit'],
        },
        {
            headers: headers,
        })
        .then((response) => {
            console.log('Successfully created payment intent:')
            console.log(response.data)
            res.json({
                client_secret: response.data.client_secret,
                amount: response.data.amount,
            });
        })
        .catch((error) => {
            let errorMsg = 'Unable to create and return paymentIntent'

            if (error.response) {
                // Request made and server responded
                console.log(error.response.data)
                errorMsg = error.response.data.message
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message)
            }

            res.status(400).send({ message: errorMsg })
        })
})
app.use ('/.netlify/functions/app', router);

module.exports = app;
module.exports.handler = serverless(app);

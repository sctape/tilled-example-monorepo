import express, { Request, Response } from "express";
import cors from "cors";
import {
    SubscriptionsApi,
    SubscriptionsApiApiKeys,
    PaymentIntentsApi,
    PaymentIntentsApiApiKeys,
    PaymentMethodsApi,
    PaymentMethodsApiApiKeys,
    PaymentMethod,
    PaymentIntentCreateParams,
    PaymentIntentConfirmParams,
    PaymentMethodAttachParams,
    SubscriptionCreateParams
} from "tilled-node";
import * as dotenv from "dotenv";
dotenv.config();
// const tilled_account = process.env.TILLED_ACCOUNT;
const tilledSecretApiKey = process.env.TILLED_SECRET_KEY;
const baseUrl = "https://sandbox-api.tilled.com";
const port = process.env.port || 5052;

const app = express();
app.use(express.json());
app.use(cors());


// Set up apis
const paymentIntentsApi = new PaymentIntentsApi();

paymentIntentsApi.setApiKey(
    PaymentIntentsApiApiKeys.TilledApiKey,
    tilledSecretApiKey
);
paymentIntentsApi.basePath = baseUrl;

const paymentMethodsApi = new PaymentMethodsApi();
paymentMethodsApi.setApiKey(
    PaymentMethodsApiApiKeys.TilledApiKey,
    tilledSecretApiKey
);
paymentMethodsApi.basePath = baseUrl;

const subscriptionsApi = new SubscriptionsApi();
subscriptionsApi.setApiKey(
    SubscriptionsApiApiKeys.TilledApiKey,
    tilledSecretApiKey
);
subscriptionsApi.basePath = baseUrl;

app.post('/payment-intents', (req: Request & {
    headers: {
        tilled_account: string
    },
    body: PaymentIntentCreateParams,
}, res: Response & {
    json: any;
    send: any;
    status: any
}) => {
    const { tilled_account } = req.headers;
    const paymentIntentCreateParams = req.body
    paymentIntentsApi
        .createPaymentIntent(
            tilled_account,
            paymentIntentCreateParams
        )
        .then(response => {
            return response.body;
        })
        .then(data => {
            res.json(data);
            console.log(data);
        })
        .catch(error => {
            console.error(error);
            res.status(404).json(error)
        });
})

app.post('/payment-intents/:id/confirm', (req: Request & {
    headers: {
        tilled_account: string
    },
    params: {
        id: string,
    },
    body: PaymentIntentConfirmParams,
}, res: Response & {
    json: any;
    send: any;
    status: any
}) => {
    const { tilled_account } = req.headers;
    const id = req.params.id;
    const paymentIntentConfirmParams = req.body
    console.log('-------------req.body-------------', paymentIntentConfirmParams)
    paymentIntentsApi
        .confirmPaymentIntent(
            tilled_account,
            id,
            req.body as PaymentIntentConfirmParams
        )
        .then(response => {
            return response.body;
        })
        .then(data => {
            res.json(data);
            console.log(data);
        })
        .catch(error => {
            console.error(error);
            res.status(404).json(error)
        });
})

app.post('/payment-methods/:id/attach', (req: Request & {
    headers: {
        tilled_account: string
    },
    params: {
        id: string,
    },
    body: PaymentMethodAttachParams,
}, res: Response & {
    json: any;
    send: any;
    status: any
}) => {
    const { tilled_account } = req.headers;
    const id = req.params.id;
    const paymentMethodAttachParams = req.body
    paymentMethodsApi
        .attachPaymentMethodToCustomer(
            tilled_account,
            id,
            paymentMethodAttachParams
        )
        .then(response => {
            return response.body;
        })
        .then(data => {
            res.json(data);
            console.log(data);
        })
        .catch(error => {
            console.error(error);
            res.status(404).json(error)
        });
})

app.get('/listPaymentMethods', (req: Request & {
    query: {
        tilled_account: string,
        type: 'card' | 'ach_debit' | 'eft_debit',
        customer_id: string,
        metadata?: { [key: string]: string },
        offset?: number,
        limit?: number
    }
}, res: Response & {
    json: any;
    send: any;
    status: any;
}) => {
    let { tilled_account, type, customer_id, metadata, offset, limit, } = req.query;

    paymentMethodsApi
        .listPaymentMethods(
            tilled_account,
            type,
            customer_id,
            metadata || undefined,
            offset || 0,
            limit || 100,
        )
        .then(response => {
            return response.body;
        })
        .then(data => {
            res.json(data)
            console.log(data)
        })
        .catch(error => {
            console.error(error);
            res.status(404).json(error)
        });
});

app.post('/subscriptions', (req: Request & {
    headers: {
        tilled_account: string
    },
    body: SubscriptionCreateParams,
}, res: Response & {
    json: any;
    send: any;
    status: any
}) => {
    const { tilled_account } = req.headers;
    const createSubscriptionParams = req.body;
    createSubscriptionParams.billing_cycle_anchor = new Date(req.body.billing_cycle_anchor);

    subscriptionsApi
        .createSubscription(
            tilled_account,
            createSubscriptionParams
        )
        .then(response => {
            return response.body;
        })
        .then(data => {
            res.json(data)
            console.log(data)
        })
        .catch(error => {
            console.error(error);
            res.status(404).json(error)
        });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    //   open(`http://localhost:${port}`)
})
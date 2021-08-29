import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2020-08-27',
})
const app = express()
const port = 8000

app.use(
  session({
    secret: 'Set this to a random string that is kept secure',
    resave: false,
    saveUninitialized: true,
  })
)

declare module 'express-session' {
  export interface SessionData {
    accountID: string
  }
}

app.use(express.static('public'))
app.use(express.json())

app.get('/', async (req, res) => {
  // アカウント作成
  const account = await stripe.accounts.create({
    type: 'standard',
  })
  const accountId = account.id
  req.session.accountID = accountId

  // アカウントリンクを作成
  const accountLinks = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `http://localhost:${port}/reauth`,
    return_url: `http://localhost:${port}/return`,
    type: 'account_onboarding',
  })

  res.redirect(accountLinks.url)
})

app.get('/reauth', async (req, res) => {
  const accountId = req.session.accountID
  if (!accountId) {
    res.redirect('/')
    return
  }
  // アカウントリンクを作成
  const accountLinks = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `http://localhost:${port}/reauth`,
    return_url: `http://localhost:${port}/return`,
    type: 'account_onboarding',
  })

  res.redirect(accountLinks.url)
})

app.get('/return', async (req, res) => {
  const accountId = req.session.accountID
  if (!accountId) {
    res.redirect('/')
    return
  }
  // アカウント登録プロセスを完了しているか確認
  const account = await stripe.accounts.retrieve(accountId)
  console.log(account.charges_enabled)
  // TODO charges_enabledとdetails_submittedを見て登録が正常に行われたか確認
  res.send('return')
})

// client-secret取得
app.get('/client-secret', async (req, res) => {
  const amount = 1000
  const applicationFee = 1000 * 0.3

  const paymentIntent = await stripe.paymentIntents.create(
    {
      payment_method_types: ['card'],
      amount: amount,
      currency: 'jpy',
      application_fee_amount: applicationFee,
    },
    {
      // 売り手のアカウントID
      stripeAccount: req.session.accountID,
    }
  )

  res.json({
    clientSecret: paymentIntent.client_secret,
  })
})

// Match the raw body to content type application/json
app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (request, response) => {
    const event = request.body

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('PaymentIntent was successful!' + paymentIntent)
        break
      }
      case 'payment_method.attached': {
        const paymentMethod = event.data.object
        console.log('PaymentMethod was attached to a Customer!' + paymentMethod)
        break
      }
      // ... handle other event types
      default: {
        console.log(`Unhandled event type ${event.type}`)
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    response.json({ received: true })
  }
)

app.listen(4242, () => console.log('Running on port 4242'))
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

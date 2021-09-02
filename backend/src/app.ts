import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import Stripe from 'stripe'
import {
  register,
  login,
  issueAccessToken,
  accessToken2User,
  findAccount,
  saveAccount,
  removeDraft,
} from './db'
import cors from 'cors'

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
app.use(cors())

declare module 'express-session' {
  export interface SessionData {
    accountID: string
  }
}

app.use(express.static('public'))
app.use(express.json())

app.post('/login', (req, res) => {
  const data = req.body
  try {
    const user = login(data.loginId, data.password)
    res.json({
      token: issueAccessToken(user).accessToken,
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
    })
  }
})

app.post('/register', (req, res) => {
  const data = req.body
  try {
    const user = register(data.loginId, data.password)
    res.json({
      success: true,
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
    })
  }
})
// tokenの認証
app.post('/user', (req, res) => {
  try {
    const token = req.header('Authorization') || ''
    const user = accessToken2User(token)
    res.json({
      user,
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
    })
  }
})

app.post('/connect_stripe', async (req, res) => {
  try {
    const token = req.header('Authorization') || ''
    const user = accessToken2User(token)
    // 既にアカウントがあれば↓は不要
    let account = findAccount(user)
    if (!account) {
      // アカウント作成
      const res = await stripe.accounts.create({
        type: 'standard',
      })
      account = saveAccount(user, res.id)
    }
    // アカウントリンクを作成
    const accountLinks = await stripe.accountLinks.create({
      account: account.stripeAccountId,
      refresh_url: `http://localhost:3000/reauth`,
      return_url: `http://localhost:3000/return`,
      type: 'account_onboarding',
    })
    res.json({
      url: accountLinks.url,
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
    })
  }
})

app.get('/done_connetcted', async (req, res) => {
  try {
    const token = req.header('Authorization') || ''
    const user = accessToken2User(token)
    const account = findAccount(user)

    if (!account) {
      throw new Error('Stripe Account not found')
    }
    // アカウント登録プロセスを完了しているか確認
    const r = await stripe.accounts.retrieve(account.stripeAccountId)
     // charges_enabledとdetails_submittedを見て登録が正常に行われたか確認
    if (r.charges_enabled && r.details_submitted) {
      removeDraft(account)
    }
    res.json({
      success: true,
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
    })
  }
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

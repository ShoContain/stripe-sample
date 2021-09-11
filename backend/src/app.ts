import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import 'express-async-errors'
import Stripe from 'stripe'
import {
  User,
  register,
  login,
  issueAccessToken,
  accessToken2User,
  findAccount,
  saveAccount,
  removeDraft,
  registerProduct,
  listProductByUser,
  listProducts,
  loadData,
  saveData,
  findProduct,
} from './db'
import cors from 'cors'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2020-08-27',
})
const app = express()
const port = 8000
const webhookSecret: string = 'hofe'

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

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      authUser: User
    }
  }
}

app.use(express.static('public'))
app.use(express.json())

// tokenの認証
app.use((req, res, next) => {
  if (
    [
      '/login',
      '/register',
      '/list_product',
      '/buy_products',
      '/webhook',
    ].includes(req.originalUrl)
  ) {
    next()
  } else {
    const token = req.header('Authorization') || ''
    const user = accessToken2User(token)
    req.authUser = user
    next()
  }
})

app.post('/login', (req, res) => {
  const data = req.body
  const user = login(data.loginId, data.password)
  res.json({
    token: issueAccessToken(user).accessToken,
  })
})

app.post('/register', (req, res) => {
  const data = req.body
  register(data.loginId, data.password)
  res.json({
    success: true,
  })
})

app.post('/user', (req, res) => {
  const user = req.authUser
  const account = findAccount(user.id)
  res.json({
    user,
    account,
  })
})

app.post('/connect_stripe', async (req, res) => {
  let account = findAccount(req.authUser.id)
  if (!account) {
    // アカウント作成、既にアカウントがあれば不要
    const res = await stripe.accounts.create({
      type: 'standard',
    })
    account = saveAccount(req.authUser, res.id)
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
})

app.get('/done_connetcted', async (req, res) => {
  const account = findAccount(req.authUser.id)

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
})

app.post('/register_product', async (req, res) => {
  const data = req.body
  registerProduct(req.authUser, data.name, parseInt(data.price, 10), data.url)
  res.json({
    success: true,
  })
})

app.post('/list_product_by_user', async (req, res) => {
  const products = listProductByUser(req.authUser)
  res.json({
    products: products,
  })
})

app.post('/list_product', async (req, res) => {
  const products = listProducts(req.body.query)
  res.json({
    products: products,
  })
})

// -----------------------------------------------------------------
// client-secret取得
app.post('/buy_products', async (req, res) => {
  const data = req.body
  const product = findProduct(data.productId)
  const userAccount = findAccount(product.userId)
  if (!userAccount) {
    // ダッシュボードでStripeと連携されないと商品登録をさせないようにするべき
    throw new Error('Stripe Account Not Connected')
  }

  const price = product.price
  const applicationFee = price * 0.1

  const paymentIntent = await stripe.paymentIntents.create(
    {
      payment_method_types: ['card'],
      amount: price,
      currency: 'jpy',
      application_fee_amount: applicationFee,
    },
    {
      stripeAccount: userAccount.stripeAccountId,
    }
  )

  res.json({
    stripe_account: userAccount.stripeAccountId,
    client_secret: paymentIntent.client_secret,
  })
})

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    const sig = request.headers['stripe-signature'] ? request.headers['stripe-signature']:''

    let event: Stripe.Event

    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks/signatures for more information.
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, webhookSecret)
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'payment_intent.succeeded') {
      const stripeObject: Stripe.PaymentIntent = event.data
        .object as Stripe.PaymentIntent
      console.log(`💰 PaymentIntent status: ${stripeObject.status}`)
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge
      console.log(`💵 Charge id: ${charge.id}`)
    } else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    response.json({ received: true })
  }
)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // handle error
  return res.status(400).json({
    error: err.message,
  })
})

app.listen(port, () => {
  loadData()
  console.log(`Example app listening at http://localhost:${port}`)
})

process.on('exit', () => {
  // ここに終了時の処理を書く
  saveData()
})

process.on('SIGINT', () => {
  process.exit()
})

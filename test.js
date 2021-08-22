const express = require('express')
const session = require("express-session");
const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY'])
const app = express()
const port = 8000

app.use(
  session({
    secret: "Set this to a random string that is kept secure",
    resave: false,
    saveUninitialized: true,
  })
)

app.get('/', async(req, res) => {
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

app.get('/reauth', async(req, res) => {
  const accountId = req.session.accountID
  if(!accountId){
    res.redirect('/')
    return;
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

app.get('/return', async(req, res) => {
  const accountId = req.session.accountID
  if(!accountId){
    res.redirect('/')
    return;
  }
   // アカウント登録プロセスを完了しているか確認
   const account = await stripe.accounts.retrieve(
    accountId
  );
  console.log(account.charges_enabled)
  // TODO charges_enabledとdetails_submittedを見て登録が正常に行われたか確認
  res.send('return')

})

app.get("/client-secret", async (req, res) => {
  // Amountはここで計算
  const paymentIntent = await stripe.paymentIntents.create({
    payment_method_types:['card'],
    amount: calculateOrderAmount(items),
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from '../components/CheckoutForm'

interface Product {
  id: number
  userId: number
  name: string
  price: number
  url: string
}

export default function Products() {
  const router = useRouter()

  const [products, setProducts] = useState([] as Product[])
  const [clientSecret, setClientSecret] = useState('')
  const [stripePromise, setStripePromise] = useState({} as any)

  useEffect(() => {
    ;(async () => {
      await fetchProducts()
    })()
  }, [])

  const fetchProducts = async () => {
    // 商品一覧の取得
    const list = await fetch('http://localhost:8000/list_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    const data = await list.json()
    setProducts(data.products)
  }

  const doBuy = async (productId: number) => {
    // 商品一覧の取得
    const res = await fetch('http://localhost:8000/buy_products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
      }),
    })
    const data = await res.json()
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '', {
      stripeAccount: data.stripe_account,
    })
    setStripePromise(stripePromise)
    setClientSecret(data.client_secret)
  }
  return (
    <div className="container mx-auto">
      <Head>
        <title>商品一覧</title>
      </Head>
      {products.map((p) => (
        // eslint-disable-next-line react/jsx-key
        <ul className="border-2 p-2">
          <li>{p.name}</li>
          <li>{p.price}</li>
          <button
            onClick={() => {
              doBuy(p.id)
            }}
            className="bg-green-300"
          >
            購入
          </button>
        </ul>
      ))}
      {clientSecret ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm client_secret={clientSecret} />
        </Elements>
      ) : (
        <div></div>
      )}
    </div>
  )
}

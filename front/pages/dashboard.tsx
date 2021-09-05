import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import RegisterProduct from '../components/RegisterProduct'

interface Product {
  id: number
  userId: number
  name: string
  price: number
  url: string
}

export default function DashBoard() {
  const router = useRouter()
  const [user, setUser] = useState({
    loginId: '',
  })
  const [account, setAccount] = useState({
    userId: '',
  })

  const [products, setProducts] = useState([] as Product[])

  useEffect(() => {
    ;(async () => {
      await fetchUser()
      await fetchProducts()
      
    })()
  }, [])

  const fetchUser = (async () => {
    const res = await fetch('http://localhost:8000/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    if (data.error) {
      router.replace('/login')
      return
    }
    setUser(data.user)
    setAccount(data.account || '')

  })
  const fetchProducts = (async () => {
    // 商品一覧の取得
    const list = await fetch('http://localhost:8000/list_product_by_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({}),
    })
    const data2 = await list.json()
    setProducts(data2.products)
  })

  const connectStripe = useCallback(async () => {
    const res = await fetch('http://localhost:8000/connect_stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    if (data.error) {
      console.log(data)
      return
    }
    location.href = data.url
  }, [])
  return (
    <div className="container mx-auto">
      <Head>
        <title>ダッシュボード</title>
      </Head>
      <div>ダッシュボード</div>
      <div>こんにちは{user.loginId}</div>
      <div>
        ストライプ連携は{account.userId ? 'されています' : 'されていません'}
      </div>
      <button
        onClick={connectStripe}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        ストライプ連帯
      </button>
      <hr />
      <RegisterProduct onRegistered={fetchProducts}></RegisterProduct>
      {products.map((p) => (
        // eslint-disable-next-line react/jsx-key
        <div>
          <div>{p.name}</div>
          <div>{p.price}</div>
        </div>
      ))}
    </div>
  )
}

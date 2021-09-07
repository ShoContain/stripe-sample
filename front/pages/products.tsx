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

export default function Products() {
  const router = useRouter()

  const [products, setProducts] = useState([] as Product[])

  useEffect(() => {
    ;(async () => {
      await fetchProducts()
    })()
  }, [])

  const fetchProducts = (async () => {
    // 商品一覧の取得
    const list = await fetch('http://localhost:8000/list_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}),
    })
    const data = await list.json()
    setProducts(data.products)
  })
  return (
    <div className="container mx-auto">
      <Head>
        <title>商品一覧</title>
      </Head>
      {products.map((p) => (
        // eslint-disable-next-line react/jsx-key
        <ul className='border-2 p-2'>
          <li>{p.name}</li>
          <li>{p.price}</li>
        </ul>
      ))}
    </div>
  )
}

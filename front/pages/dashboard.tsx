import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function DashBoard() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
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
      // ダッシュボードに必要な情報の取得
    })()
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
    if(data.error){
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
      <button
        onClick={connectStripe}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        ストライプ連帯
      </button>
    </div>
  )
}

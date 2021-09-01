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
    async function fetchUser() {
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
    }
    fetchUser()
  })

  return (
    <div className="container mx-auto">
      <Head>
        <title>ダッシュボード</title>
      </Head>
      <div>ダッシュボード</div>
    </div>
  )
}

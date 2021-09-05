import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Return() {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const res = await fetch('http://localhost:8000/done_connetcted', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') || '',
        }
      })
      console.log(res)
      router.replace('/dashboard')
    })()
  },[])
  return (
    <div className="container mx-auto">
      <Head>
        <title>RETURN</title>
      </Head>
      <div>STRIPEに設定したリターンURL先です</div>
    </div>
  )
}

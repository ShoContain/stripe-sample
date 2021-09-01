import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useState } from 'react'

export default function Register(){
  const [loginId,setLoginId] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const router = useRouter()

  const doLogin = useCallback( async ()=>{
    event?.preventDefault()
    const res = await fetch("http://localhost:8000/register",{
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        loginId,
        password
      })
    })
    const data = await res.json()
    if(data.error){
      setError(data.error)
      return
    }
    // TODO ログインにリダイレクト
    router.push('/login')
    
  },[loginId, password, router])


  return (
    <div className='container mx-auto'>
      <Head>
        <title>会員登録</title>
      </Head>
      <form　className='w-full max-w-sm mt-5'>
        <div className="md:flex md:justify-center mb-6">
          <div className="md:w-1/3">
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="login-id">
              LOGIN ID
            </label>
          </div>
          <div className="md:w-2/3">
            <input type="text" value={loginId} onChange={(e)=>setLoginId(e.target.value)} id='login-id' 
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'/>
          </div>
        </div>
        <div className="md:flex md:justify-center mb-6">
          <div className="md:w-1/3">
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">
              PASSWORD
            </label>
          </div>
          <div className="md:w-2/3">
          <input type="password" value={password} id='login-id' onChange={(e)=>setPassword(e.target.value)}
        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' />
          </div>
        </div>
        <p className='text-red-400'>{error}</p>
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" 
            type="button" onClick={doLogin}>
              Sign Up
            </button>
          </div>
        </div>
    </form>
  </div>
  )
}

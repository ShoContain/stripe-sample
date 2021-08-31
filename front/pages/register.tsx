import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useState } from 'react'

const Register  = () => {
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
    
  },[loginId,password])


  return (
    <div>
      <Head>
        <title>会員登録</title>
      </Head>
      <h1>会員登録</h1>
      <div style={{color:"red"}}>{error}</div>
      <form onSubmit={doLogin}>
      <label>
        LOGIN ID:
        <input type="text" value={loginId} onChange={(e)=>setLoginId(e.target.value)} />
      </label>
      <br/>
      <label>
        PASSWORD:
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      </label>
      <br/>
      <input type="submit" value="Submit" />
    </form>
  </div>
  )
}

export default Register

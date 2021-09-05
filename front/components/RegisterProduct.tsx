import { useCallback, useState } from 'react'

interface Props {
  onRegistered: () => {}
}

export default function RegisterProduct(props: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const onSubmit = useCallback(async () => {
    const res = await fetch('http://localhost:8000/register_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token') || '',
      },
      body: JSON.stringify({
        name,
        price,
        url,
      }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      return
    }
    setName('')
    setPrice(0)
    setUrl('')
    setError('')
    props.onRegistered()
  }, [name, price, url])
  return (
    <div className="container mx-auto">
      <div className="text-red-600">{error}</div>
      <div className="md:w-1/3">
        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="name"
        >
          名前
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="name"
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>
      </div>
      <div className="md:w-1/3">
        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="price"
        >
          価格
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="price"
          type="number"
          placeholder="価格"
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10))}
        ></input>
      </div>
      <div className="md:w-1/3">
        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="url"
        >
          URL
        </label>
        <input
          className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
          id="url"
          type="text"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        ></input>
      </div>
      <button
        className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        type="button"
        onClick={onSubmit}
      >
        新規作成
      </button>
    </div>
  )
}

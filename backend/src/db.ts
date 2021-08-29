import crypto from 'crypto'
interface User {
  id: number
  loginId: string
  password: string
}

interface Account {
  userId: number
  stripeAccountId: string
}

interface Products {
  id: number
  userId: number
  name: string
  amount: number
  url: string
}

interface Settlement {
  id: number
  productId: number
  userId: number
  createAt: Date
}

// util
const md5str = (str: string) => {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'binary').digest('hex')
}

// User
const users: User[] = []

const hasDuplicatedId = (loginId: string): User | undefined => {
  return users.find((u) => u.loginId === loginId)
}
// 会員登録
const register = (loginId: string, password: string): User => {
  if (!hasDuplicatedId(loginId)) {
    throw new Error('duplicated loginId')
  }
  const user: User = {
    id: users.length + 1,
    loginId,
    password: md5str(password),
  }

  users.push(user)
  return user
}

// ログイン
const login = (loginId: string, password: string): User => {
  const user = hasDuplicatedId(loginId)
  if (!user) {
    throw new Error('user not found')
  }
  if (user.password !== md5str(password)) {
    throw new Error('Password is wrong')
  }
  return user
}

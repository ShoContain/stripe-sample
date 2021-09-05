import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'

export interface User {
  id: number
  loginId: string
  password: string
}

interface Account {
  userId: number
  stripeAccountId: string
  draft: Boolean
}

interface AccessToken {
  userId: number
  accessToken: string
}

interface Product {
  id: number
  userId: number
  name: string
  price: number
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
let users: User[] = []

const hasDuplicatedId = (loginId: string): User | undefined => {
  return users.find((u) => u.loginId === loginId)
}
// 会員登録
export const register = (loginId: string, password: string): User => {
  if (hasDuplicatedId(loginId)) {
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
export const login = (loginId: string, password: string): User => {
  const user = hasDuplicatedId(loginId)
  if (!user) {
    throw new Error('user not found')
  }
  if (user.password !== md5str(password)) {
    throw new Error('user not found')
  }
  return user
}

// AccessToken
let accessTokens: AccessToken[] = []
export const issueAccessToken = (user: User): AccessToken => {
  accessTokens = accessTokens.filter((a) => a.userId !== user.id)
  const at: AccessToken = {
    userId: user.id,
    accessToken: uuidv4(),
  }
  accessTokens.push(at)
  return at
}

export const accessToken2User = (accessToken: string): User => {
  const at = accessTokens.find((a) => a.accessToken === accessToken)
  if (!at) {
    throw new Error('can not log in')
  }
  const user = users.find((u) => u.id === at.userId)
  if (!user) {
    throw new Error('can not log in')
  }
  return user
}

// Account
let accounts: Account[] = []
export const findAccount = (user: User): Account | undefined => {
  return accounts.find((a) => a.userId === user.id)
}

export const saveAccount = (user: User, accountId: string): Account => {
  const a: Account = {
    userId: user.id,
    stripeAccountId: accountId,
    draft: true,
  }
  accounts.push(a)
  return a
}

export const removeDraft = (account: Account): Account => {
  account.draft = false
  return account
}

// Products
// 商品登録
let products: Product[] = []

export const registerProduct = (
  user: User,
  name: string,
  price: number,
  url: string
): Product => {
  if (!name) {
    throw new Error('name required')
  }
  if (!price) {
    throw new Error('price required')
  }
  if (price < 0) {
    throw new Error('invalid price')
  }
  if (!url) {
    throw new Error('url required')
  }

  const p: Product = {
    id: products.length + 1,
    userId: user.id,
    name,
    price,
    url,
  }
  products.push(p)
  return p
}

// 対象ユーザーの商品取得
export const listProductByUser = (user: User): Product[] => {
  return products.filter((p) => p.userId === user.id)
}

// 全検索
export const listProducts = (query: string): Product[] => {
  if (!query) {
    return products
  }
  return products.filter((p) => p.name.indexOf(query) !== -1)
}

// Settlement

// general
export const saveData = () => {
  fs.writeFileSync(
    'data.json',
    JSON.stringify({
      users,
      accessTokens,
      accounts,
      products,
    })
  )
  console.log('----- data saved ------')
}

// general
export const loadData = () => {
  if (!fs.existsSync('data.json')) {
    return
  }
  const data = JSON.parse(fs.readFileSync('data.json').toString())
  users = data.users
  accessTokens = data.accessTokens
  accounts = data.accounts
  products = data.products
  console.log('----- data loaded ------')
}

import Cookies from 'js-cookie'

const TokenKey = 'abc-admin-token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    return Cookies.set(TokenKey, token, { expires: 1 })
  } else return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

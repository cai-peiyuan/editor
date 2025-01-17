import Cookies from 'js-cookie'

const TokenKey = 'abc-admin-token'

export function getToken() {
  var token = sessionStorage.getItem("abc-admin-token")
  if(token){
    return token
  }else{
    return Cookies.get(TokenKey)
  }
}

export function setToken(token: string, rememberMe: boolean) {
  sessionStorage.setItem("abc-admin-token",token);
  if (rememberMe) {
    return Cookies.set(TokenKey, token, { expires: 1 })
  } else return Cookies.set(TokenKey, token)
}

export function removeToken() {
  sessionStorage.removeItem("abc-admin-token")
  return Cookies.remove(TokenKey)
}


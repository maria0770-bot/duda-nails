
import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children, aoExpirar }) {

  async function apiAutenticada(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes)

    if (resposta.status === 401) {
      aoExpirar()
    }

    return resposta
  }

  return (
    <AuthContext.Provider value={{ apiAutenticada }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

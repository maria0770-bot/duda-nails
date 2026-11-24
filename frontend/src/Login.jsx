
import { useState } from 'react'

function Login({ aoEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function fazerLogin(evento) {
    evento.preventDefault()
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Não foi possível entrar.')
        return
      }

      if (!dados.token) {
        setMensagem('O servidor não enviou o token.')
        return
      }

      aoEntrar(dados.token)
      setMensagem('Login realizado com sucesso!')
      setSenha('')
    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section>
      <h2>Entrar no Duda Nails</h2>

      <form onSubmit={fazerLogin}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && <p role="status">{mensagem}</p>}
    </section>
  )
}

export default Login

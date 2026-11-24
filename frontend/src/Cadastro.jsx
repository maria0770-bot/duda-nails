
import { useState } from 'react'

function Cadastro({ aoVoltar }) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function cadastrar(evento) {
    evento.preventDefault()
    setMensagem('')

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.')
      return
    }

    if (senha.length < 8) {
      setMensagem('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setCarregando(true)

    try {
      const resposta = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          telefone,
          email,
          senha
        })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao realizar cadastro.')
        return
      }

      setMensagem('Cadastro realizado com sucesso! Agora faça login.')

      setNome('')
      setTelefone('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section>
      <h2>Criar minha conta</h2>

      <form onSubmit={cadastrar}>
        <label>Nome completo</label>
        <input
          type="text"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
        />

        <label>Telefone</label>
        <input
          type="tel"
          value={telefone}
          onChange={(evento) => setTelefone(evento.target.value)}
          required
        />

        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          required
        />

        <label>Confirmar senha</label>
        <input
          type="password"
          value={confirmarSenha}
          onChange={(evento) => setConfirmarSenha(evento.target.value)}
          required
        />

        <button type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Criar conta'}
        </button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <button type="button" onClick={aoVoltar}>
        Voltar para o login
      </button>
    </section>
  )
}

export default Cadastro

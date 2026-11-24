
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import Admin from './Admin'
import Cliente from './Cliente'
import Cadastro from './Cadastro'
import Galeria from './Galeria'
import { AuthProvider } from './AuthContext'

function App() {
  const [servicos, setServicos] = useState([])
  const [token, setToken] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [mensagemSessao, setMensagemSessao] = useState('')
  
  function entrar(dados) {
  setToken(dados.token)
  setUsuario(dados.usuario)
  setMensagemSessao('')
}

function sair() {
  setToken(null)
  setUsuario(null)
}

function sessaoExpirada() {
  sair()
  setMostrarCadastro(false)
  setMensagemSessao('Sua sessão expirou. Entre novamente.')
  window.location.hash = 'login'

  setTimeout(() => {
    alert('Sua sessão expirou. Entre novamente.')
  }, 200)
}

  async function listarServicos() {
    try {
      const resposta = await fetch('/api/servicos')
      const dados = await resposta.json()

      if (resposta.ok) {
        setServicos(dados)
      }
    } catch (erro) {
      console.log('Erro:', erro)
    }
  }

  useEffect(() => {
    listarServicos()
  }, [])

  return (
   <AuthProvider aoExpirar={sessaoExpirada}>
     <div className="site">
      <header>
        <h1>💅 Duda Nails</h1>

        <nav>
          <a href="#inicio">Início</a>
          <a href="#servicos">Serviços</a>
          <a href="#login">Login</a>
        </nav>
      </header>

      <main>
        <section id="inicio" className="inicio">
          <h2>Bem-vinda ao Duda Nails!</h2>

          <p>Unhas lindas, feitas com carinho e dedicação.</p>

          <a href="#servicos">Conheça nossos serviços</a>
        </section>

        <section id="login">
          {mensagemSessao && <p>{mensagemSessao}</p>}
          {token ? (
            <div>
              <p>Bem-vindo(a), {usuario?.nome}!</p>

              <p>
                Tipo de conta: {usuario?.tipo === 'admin'
                  ? 'Administrador'
                  : 'Cliente'}
              </p>

              <button type="button" onClick={sair}>
                Sair
              </button>

              {usuario?.tipo === 'admin' && (
                <Admin
                  token={token}
                  aoAtualizarServicos={listarServicos}
                />
              )}

              {usuario?.tipo === 'cliente' && (
                <Cliente token={token} />
              )}
            </div>

          ) : mostrarCadastro ? (
            <Cadastro
              aoVoltar={() => setMostrarCadastro(false)}
            />

          ) : (
            <div>
              <Login aoEntrar={entrar} />

              <button
                type="button"
                onClick={() => setMostrarCadastro(true)}
              >
                Criar minha conta
              </button>
            </div>
          )}
        </section>

        <section id="servicos" className="servicos">
          <h2>Nossos serviços</h2>

          <div className="lista-servicos">
            {servicos.map((servico) => (
              <div className="card" key={servico.id}>
                <h3>{servico.nome}</h3>

                <p>
                  R$ {Number(servico.preco).toFixed(2).replace('.', ',')}
                </p>

                <Galeria
                  servicoId={servico.id}
                  atualizacao={servicos}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© Duda Nails</p>
      </footer>
       </div>
  </AuthProvider>
  )
}

export default App

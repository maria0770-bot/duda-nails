
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'

function App() {
  const [servicos, setServicos] = useState([])
  const [token, setToken] = useState(null)

  useEffect(() => {
fetch('/api/servicos') 
      .then((resposta) => resposta.json())
      .then((dados) => setServicos(dados))
      .catch((erro) => console.log('Erro:', erro))
  }, [])

  return (
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
          {token ? (
            <div>
              <p>Você está conectado!</p>
              <button onClick={() => setToken(null)}>
                Sair
              </button>
            </div>
          ) : (
            <Login aoEntrar={setToken} />
          )}
        </section>

        <section id="servicos" className="servicos">
          <h2>Nossos serviços</h2>

          <div className="lista-servicos">
            {servicos.map((servico) => (
             
          <div className="card" key={servico.id}>
            <h3>{servico.nome}</h3>
            <p>R$ {Number(servico.preco).toFixed(2).replace('.', ',')}</p>
          </div>
  ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© Duda Nails</p>
      </footer>
    </div>
  )
}

export default App

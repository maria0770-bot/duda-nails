import { useState } from 'react'
import ServicosAdmin from './ServicosAdmin'
import AgendamentosAdmin from './AgendamentosAdmin'
import ReferenciasAdmin from './ReferenciasAdmin'
import ReferenciasCliente from './ReferenciasCliente'
import { useAuth } from './AuthContext'

function Admin({ token, aoAtualizarServicos }) { 
  const { apiAutenticada } = useAuth()
  const [clientes, setClientes] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [tela, setTela] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [clienteEditando, setClienteEditando] = useState(null)

  // Preencher o formulário para edição
  function editarCliente(cliente) {
    setClienteEditando(cliente.id)
    setNome(cliente.nome)
    setTelefone(cliente.telefone || '')
    setMensagem('Editando cliente: ' + cliente.nome)
  }

  // Cancelar edição
  function cancelarEdicao() {
    setClienteEditando(null)
    setNome('')
    setTelefone('')
  }

  // Cadastrar ou atualizar cliente
  async function cadastrarCliente(evento) {
    evento.preventDefault()
    setMensagem('')

    try {
      const resposta = await apiAutenticada(
        clienteEditando
          ? `/api/clientes/${clienteEditando}`
          : '/api/clientes',
        {
          method: clienteEditando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ nome, telefone })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao salvar cliente.')
        return
      }

      cancelarEdicao()

      if (await listarClientes()) {
        setMensagem(
          clienteEditando
            ? 'Cliente atualizado com sucesso!'
            : 'Cliente cadastrado com sucesso!'
        )
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Excluir cliente
  async function excluirCliente(id) {
    if (!window.confirm('Deseja realmente excluir este cliente?')) {
      return
    }

    setMensagem('')

    try {
      const resposta = await apiAutenticada(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao excluir cliente.')
        return
      }

      cancelarEdicao()

      if (await listarClientes()) {
        setMensagem('Cliente excluído com sucesso!')
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Listar clientes
  async function listarClientes() {
    setTela('clientes')
    setMensagem('')

    try {
      const resposta = await apiAutenticada('/api/clientes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        
        setMensagem(dados.erro || 'Erro ao listar clientes.')
        return false
      }

      setClientes(dados)
      return true

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
      return false
    }
  }

  return (
    <section>
      <h2>Painel do administrador</h2>

      <button type="button" onClick={listarClientes}>
        Gerenciar clientes
      </button>

    <button type="button" onClick={() => {
    setTela('servicos')
    setMensagem('')
    }}>
    Gerenciar serviços
    </button>    
    <button type="button" onClick={() => {
    setTela('agendamentos')
    setMensagem('')
    }}>
    Gerenciar agendamentos
    </button>   
   <button type="button" onClick={() => {
    setTela('referencias')
    setMensagem('')
    }}>
    Gerenciar referências
    </button>

      {mensagem && <p>{mensagem}</p>}

      {tela === 'servicos' && (
        <ServicosAdmin
        token={token}
        aoAtualizarServicos={aoAtualizarServicos}
        />     )}

        {tela === 'agendamentos' && (
        <AgendamentosAdmin token={token} />
        )}
        
        {tela === 'referencias' && (
        <ReferenciasAdmin
            token={token}
            aoAtualizarServicos={aoAtualizarServicos}
        />
        )}

        {tela === 'clientes' && (

        <div>
          <h3>Clientes cadastrados</h3>

          <form onSubmit={cadastrarCliente}>
            <h4>
              {clienteEditando
                ? 'Editar cliente'
                : 'Cadastrar novo cliente'}
            </h4>

            <input
              type="text"
              placeholder="Nome do cliente"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="Telefone"
              value={telefone}
              onChange={(evento) => setTelefone(evento.target.value)}
            />

            <button type="submit">
              {clienteEditando
                ? 'Salvar alterações'
                : 'Cadastrar'}
            </button>

            {clienteEditando && (
              <button type="button" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
          </form>

          {clientes.map((cliente) => (
            <div key={cliente.id}>
              <p>Nome: {cliente.nome}</p>

              <p>
                Telefone: {cliente.telefone || 'Não informado'}
              </p>

              <button
                type="button"
                onClick={() => editarCliente(cliente)}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => excluirCliente(cliente.id)}
              >
                Excluir
              </button>

              <ReferenciasCliente
                token={token}
                clienteId={cliente.id}
                />

              <hr />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Admin

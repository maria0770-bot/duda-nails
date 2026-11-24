
import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

function ServicosAdmin({ token, aoAtualizarServicos }) { 
  const { apiAutenticada } = useAuth()
  const [servicos, setServicos] = useState([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [referencias, setReferencias] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [servicoEditando, setServicoEditando] = useState(null)

  // Listar serviços
  async function listarServicos() {
    try {
      const resposta = await apiAutenticada('/api/servicos')
      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao listar serviços.')
        return false
      }

      setServicos(dados)
      return true
    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
      return false
    }
  }

  useEffect(() => {
    listarServicos()
  }, [])

  // Editar serviço
  function editarServico(servico) {
    setServicoEditando(servico.id)
    setNome(servico.nome)
    setPreco(servico.preco)
    setReferencias(servico.referencias || '')
    setMensagem('Editando serviço: ' + servico.nome)
  }

  // Cancelar edição
  function cancelarEdicao() {

    setServicoEditando(null)
    setNome('')
    setPreco('')
    setReferencias('')
  }

  // Cadastrar ou atualizar serviço
  async function salvarServico(evento) {
    evento.preventDefault()
    setMensagem('')

    try {
      const resposta = await apiAutenticada(
        servicoEditando
          ? `/api/servicos/${servicoEditando}`
          : '/api/servicos',
        {
          method: servicoEditando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nome,
            preco: Number(preco),
            referencias
          })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao salvar serviço.')
        return
      }

      cancelarEdicao()
      await aoAtualizarServicos()

      if (await listarServicos()) {
        setMensagem(
          servicoEditando
            ? 'Serviço atualizado com sucesso!'
            : 'Serviço cadastrado com sucesso!'
        )
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Excluir serviço
  async function excluirServico(id) {
    if (!window.confirm('Deseja realmente excluir este serviço?')) {
      return
    }

    setMensagem('')

    try {
      const resposta = await apiAutenticada(`/api/servicos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao excluir serviço.')
        return
      }

      cancelarEdicao()

      if (await listarServicos()) {
        setMensagem('Serviço excluído com sucesso!')
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  return (
    <section>
      <h3>Gerenciar serviços</h3>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={salvarServico}>
        <h4>
          {servicoEditando
            ? 'Editar serviço'
            : 'Cadastrar novo serviço'}
        </h4>

        <input
          type="text"
          placeholder="Nome do serviço"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Preço"
          min="0"
          step="0.01"
          value={preco}
          onChange={(evento) => setPreco(evento.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Referências"
          value={referencias}
          onChange={(evento) => setReferencias(evento.target.value)}
        />

        <button type="submit">
          {servicoEditando ? 'Salvar alterações' : 'Cadastrar'}
        </button>

        {servicoEditando && (
          <button type="button" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </form>

      {servicos.map((servico) => (
        <div key={servico.id}>
          <p>Nome: {servico.nome}</p>

          <p>Preço: R$ {Number(servico.preco).toFixed(2)}</p>

          <button
            type="button"
            onClick={() => editarServico(servico)}
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => excluirServico(servico.id)}
          >
            Excluir
          </button>

          <hr />
        </div>
      ))}
    </section>
  )
}

export default ServicosAdmin

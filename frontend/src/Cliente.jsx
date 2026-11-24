import { useState, useEffect } from 'react'
import ReferenciasCliente from './ReferenciasCliente'
import { useAuth } from './AuthContext'

function Cliente({ token }) {
  const { apiAutenticada } = useAuth()
  const [servicos, setServicos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [mensagem, setMensagem] = useState('')

  // Listar serviços disponíveis
  async function listarServicos() {
    try {
      const resposta = await apiAutenticada('/api/servicos')
      const dados = await resposta.json()

      if (resposta.ok) {
        setServicos(dados)
      } else {
        setMensagem(dados.erro || 'Erro ao listar serviços.')
      }
    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Listar meus agendamentos
  async function listarAgendamentos() {
    try {
      const resposta = await apiAutenticada('/api/agendamentos', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao listar agendamentos.')
        return false
      }

      setAgendamentos(dados)
      return true

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
      return false
    }
  }

  useEffect(() => {
    listarServicos()
    listarAgendamentos()
  }, [])

  // Selecionar ou desmarcar serviço
  function selecionarServico(id) {
    if (selecionados.includes(id)) {
      setSelecionados(
        selecionados.filter((servicoId) => servicoId !== id)
      )
    } else {
      setSelecionados([...selecionados, id])
    }
  }

  // Realizar agendamento
  async function agendar(evento) {
    evento.preventDefault()
    setMensagem('')

    if (selecionados.length === 0) {
      setMensagem('Selecione pelo menos um serviço.')
      return
    }

    try {
      const resposta = await apiAutenticada('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data,
          horario,
          servicos: selecionados
        })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao realizar agendamento.')
        return
      }

      setData('')
      setHorario('')
      setSelecionados([])

      if (await listarAgendamentos()) {
        setMensagem('Agendamento realizado com sucesso!')
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Cancelar agendamento
  async function cancelarAgendamento(id) {
    if (!window.confirm('Deseja cancelar este agendamento?')) {
      return
    }

    setMensagem('')

    try {
      const resposta = await apiAutenticada(`/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao cancelar agendamento.')
        return
      }

      if (await listarAgendamentos()) {
        setMensagem('Agendamento cancelado com sucesso!')
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  // Calcular valor total
  const total = servicos
    .filter((servico) => selecionados.includes(servico.id))
    .reduce((soma, servico) => soma + Number(servico.preco), 0)

  return (
    <section>
      <h2>Painel do cliente</h2>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={agendar}>
        <h3>Novo agendamento</h3>

        <h4>Escolha os serviços</h4>

        {servicos.map((servico) => (
          <div key={servico.id}>
            <label>
              <input
                type="checkbox"
                checked={selecionados.includes(servico.id)}
                onChange={() => selecionarServico(servico.id)}
              />

              {servico.nome} - R$ {Number(servico.preco).toFixed(2)}
            </label>
          </div>
        ))}

        <p>Total: R$ {total.toFixed(2)}</p>

        <label>Data</label>

        <input
          type="date"
          value={data}
          onChange={(evento) => setData(evento.target.value)}
          required
        />

        <label>Horário</label>

        <input
          type="time"
          value={horario}
          onChange={(evento) => setHorario(evento.target.value)}
          required
        />

        <button type="submit">
          Realizar agendamento
        </button>
      </form>

      <h3>Meus agendamentos</h3>

      {agendamentos.length === 0 && (
        <p>Você ainda não possui agendamentos.</p>
      )}

      {agendamentos.map((agendamento) => (
        <div key={agendamento.id}>
          <p>Agendamento: {agendamento.id}</p>

          <p>
            Serviços: {agendamento.servicos?.join(', ')}
        </p>

          <p>
            Data: {agendamento.data.slice(0, 10).split('-').reverse().join('/')}
          </p>

          <p>
            Horário: {agendamento.horario.slice(0, 5)}
          </p>

          <button
            type="button"
            onClick={() => cancelarAgendamento(agendamento.id)}
          >
            Cancelar agendamento
          </button>

        
        <hr />

        </div>
      ))}

      <ReferenciasCliente token={token} />

    </section>
  )
}

export default Cliente

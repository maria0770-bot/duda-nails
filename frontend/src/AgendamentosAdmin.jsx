import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

function AgendamentosAdmin({ token }) {
  const { apiAutenticada } = useAuth()  
  const [agendamentos, setAgendamentos] = useState([])
  const [mensagem, setMensagem] = useState('')

  // Listar agendamentos
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
    listarAgendamentos()
  }, [])

  // Cancelar agendamento
  async function cancelarAgendamento(id) {
    if (!window.confirm('Deseja realmente cancelar este agendamento?')) {
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

  return (
    <section>
      <h3>Gerenciar agendamentos</h3>

      {mensagem && <p>{mensagem}</p>}

      {agendamentos.length === 0 && (
        <p>Nenhum agendamento na lista.</p>
      )}

      {agendamentos.map((agendamento) => (
        <div key={agendamento.id}>
          <p>Agendamento: {agendamento.id}</p>

         <p>Cliente: {agendamento.cliente_nome}</p>

        <p>
        Serviços: {agendamento.servicos?.join(', ') || 'Não informado'}
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
    </section>
  )
}

export default AgendamentosAdmin

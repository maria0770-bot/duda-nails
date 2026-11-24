import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

function ReferenciasAdmin({ token, aoAtualizarServicos }) {
  const { apiAutenticada } = useAuth()
  const [servicos, setServicos] = useState([])
  const [servicoId, setServicoId] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [referencias, setReferencias] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campoArquivo = useRef(null)

  // Listar serviços
  async function listarServicos() {
    try {
      const resposta = await apiAutenticada('/api/servicos')
      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao listar serviços.')
        return
      }

      setServicos(dados)

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    }
  }

  useEffect(() => {
    listarServicos()
  }, [])

  // Listar referências do serviço
  async function listarReferencias(id) {
    try {
      const resposta = await apiAutenticada(
        `/api/servicos/${id}/referencias`
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao listar referências.')
        return false
      }

      setReferencias(dados)
      return true

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
      return false
    }
  }

  // Selecionar serviço
  async function selecionarServico(evento) {
    const id = evento.target.value

    setServicoId(id)
    setReferencias([])
    setMensagem('')

    if (id) {
      await listarReferencias(id)
    }
  }

  // Excluir foto ou vídeo
async function excluirReferencia(id) {
  if (!window.confirm('Deseja realmente excluir esta referência?')) {
    return
  }

  setMensagem('')

  try {
    const resposta = await apiAutenticada(`/api/referencias/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      setMensagem(dados.erro || 'Erro ao excluir referência.')
      return
    }

    await aoAtualizarServicos()

    if (await listarReferencias(servicoId)) {
      setMensagem('Referência excluída com sucesso!')
    }

  } catch (erro) {
    setMensagem('Erro de conexão com o servidor.')
  }
}

  // Enviar foto ou vídeo
  async function enviarReferencia(evento) {
    evento.preventDefault()
    setMensagem('')

    if (!servicoId || !arquivo) {
      setMensagem('Selecione um serviço e um arquivo.')
      return
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setMensagem('O arquivo deve ter no máximo 10 MB.')
      return
    }

    const formulario = new FormData()
    formulario.append('arquivo', arquivo)

    setEnviando(true)

    try {
      const resposta = await apiAutenticada(
        `/api/servicos/${servicoId}/referencias`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formulario
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        setMensagem(dados.erro || 'Erro ao enviar referência.')
        return
      }

      setArquivo(null)
      campoArquivo.current.value = ''

      await aoAtualizarServicos()

      if (await listarReferencias(servicoId)) {
        setMensagem('Referência enviada com sucesso!')
      }

    } catch (erro) {
      setMensagem('Erro de conexão com o servidor.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section>
      <h3>Gerenciar referências</h3>

      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={enviarReferencia}>
        <label>Selecione um serviço</label>

        <select
          value={servicoId}
          onChange={selecionarServico}
          disabled={enviando}
          required
        >
          <option value="">Escolha um serviço</option>

          {servicos.map((servico) => (
            <option key={servico.id} value={servico.id}>
              {servico.nome}
            </option>
          ))}
        </select>

        <label>Selecione uma foto ou vídeo</label>

        <input
          type="file"
          ref={campoArquivo}
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={(evento) =>
            setArquivo(evento.target.files[0] || null)
          }
          disabled={enviando}
          required
        />

        <p>Tamanho máximo: 10 MB</p>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar referência'}
        </button>
      </form>

      <h3>Referências cadastradas</h3>

      {referencias.length === 0 && (
        <p>Nenhuma referência na lista.</p>
      )}

      {referencias.map((referencia) => (
        <div key={referencia.id}>
          <p>{referencia.nome_original}</p>

          {referencia.tipo_mime.startsWith('image/') && (
            <img
              src={`/api/servicos/referencias/${referencia.id}`}
              alt={referencia.nome_original}
              width="250"
            />
          )}

          {referencia.tipo_mime.startsWith('video/') && (
            <video
              src={`/api/servicos/referencias/${referencia.id}`}
              width="250"
              controls
            />
          )}

          <button
        type="button"
        onClick={() => excluirReferencia(referencia.id)}
        >
        Excluir referência
        </button>
          <hr />
        </div>
      ))}
    </section>
  )
}

export default ReferenciasAdmin

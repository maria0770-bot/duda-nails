import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

function FotoPrivada({ id, token }) {
  const { apiAutenticada } = useAuth()
  const [foto, setFoto] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let endereco
    let ativo = true

    async function carregarFoto() {
      try {
        const resposta = await apiAutenticada(`/api/referencias/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store'
        })

        if (!resposta.ok) {
          throw new Error('Erro ao carregar foto.')
        }

        const arquivo = await resposta.blob()

        if (ativo) {
          endereco = URL.createObjectURL(arquivo)
          setFoto(endereco)
        }

      } catch (erro) {
        if (ativo) {
          setErro('Não foi possível carregar a foto.')
        }
      }
    }

    carregarFoto()

    return () => {
      ativo = false

      if (endereco) {
        URL.revokeObjectURL(endereco)
      }
    }
  }, [id, token])

  if (erro) return <p>{erro}</p>

  return foto ? (
    <img src={foto} alt="Referência da cliente" width="200" />
  ) : (
    <p>Carregando foto...</p>
  )
}

function ReferenciasCliente({ token, clienteId }) {
  const { apiAutenticada } = useAuth()
  const [id, setId] = useState(null)
  const [referencias, setReferencias] = useState([])
  const [arquivo, setArquivo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campoArquivo = useRef(null)

  async function listarReferencias(idCliente) {
    const resposta = await apiAutenticada(
      `/api/clientes/${idCliente}/referencias`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao listar referências.')
    }

    setReferencias(dados)
  }

  useEffect(() => {
    async function carregar() {
      setId(null)
      setReferencias([])
      setMensagem('')

      try {
        let idCliente = clienteId

        if (!idCliente) {
          const resposta = await apiAutenticada('/api/clientes/me/perfil', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          const dados = await resposta.json()

          if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao buscar perfil.')
          }

          idCliente = dados.id
        }

        await listarReferencias(idCliente)
        setId(idCliente)

      } catch (erro) {
        setMensagem(erro.message)
      }
    }

    carregar()
  }, [token, clienteId])

  async function enviarReferencia(evento) {
    evento.preventDefault()
    setMensagem('')

    if (!arquivo || !id) {
      setMensagem('Selecione uma foto.')
      return
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setMensagem('A foto deve ter no máximo 10 MB.')
      return
    }

    const formulario = new FormData()
    formulario.append('arquivo', arquivo)

    setEnviando(true)

    try {
      const resposta = await apiAutenticada(
        `/api/clientes/${id}/referencias`,
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
        throw new Error(dados.erro || 'Erro ao enviar foto.')
      }

      setArquivo(null)
      campoArquivo.current.value = ''

      await listarReferencias(id)

      setMensagem('Foto enviada com sucesso!')

    } catch (erro) {
      setMensagem(erro.message)

    } finally {
      setEnviando(false)
    }
  }

  return (
    <section>
      <h3>Referências de unhas</h3>

      {mensagem && <p>{mensagem}</p>}

      {!clienteId && (
        <form onSubmit={enviarReferencia}>
          <label>Envie uma foto da unha desejada</label>

          <input
            type="file"
            ref={campoArquivo}
            accept="image/jpeg,image/png,image/webp"
            onChange={(evento) =>
              setArquivo(evento.target.files[0] || null)
            }
            disabled={enviando}
            required
          />

          <p>Tamanho máximo: 10 MB</p>

          <button type="submit" disabled={enviando || !id}>
            {enviando ? 'Enviando...' : 'Enviar foto'}
          </button>
        </form>
      )}

      <h4>Fotos enviadas</h4>

      {referencias.length === 0 && (
        <p>Nenhuma foto cadastrada.</p>
      )}

      {referencias.map((referencia) => (
        <div key={referencia.id}>
          <p>{referencia.nome_original}</p>

          <FotoPrivada
            id={referencia.id}
            token={token}
          />

          <hr />
        </div>
      ))}
    </section>
  )
}

export default ReferenciasCliente


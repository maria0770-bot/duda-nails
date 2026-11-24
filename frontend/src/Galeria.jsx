
import { useState, useEffect } from 'react'

function Galeria({ servicoId, atualizacao }) {  
  const [referencias, setReferencias] = useState([])
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function listarReferencias() {
      try {
        const resposta = await fetch(
          `/api/servicos/${servicoId}/referencias`
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
          setMensagem('Erro ao carregar referências.')
          return
        }

        setReferencias(dados)
        setMensagem('')

      } catch (erro) {
        setMensagem('Erro de conexão com o servidor.')
      }
    }

    listarReferencias()
}, [servicoId, atualizacao])

  return (
    <div className="galeria">
      {mensagem && <p>{mensagem}</p>}

      {referencias.map((referencia) => (
        <div key={referencia.id}>

          {referencia.tipo_mime.startsWith('image/') && (
            <img
              src={`/api/servicos/referencias/${referencia.id}`}
              alt="Modelo de unha"
              width="200"
            />
          )}

          {referencia.tipo_mime.startsWith('video/') && (
            <video
              src={`/api/servicos/referencias/${referencia.id}`}
              width="200"
              controls
            />
          )}

        </div>
      ))}
    </div>
  )
}

export default Galeria

import { useParams } from "react-router"

const Knowledges = () => {
  const { id } = useParams()

  return <div>Knowledges: {id}</div>
}

export default Knowledges

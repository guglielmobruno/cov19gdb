from functions import App
from read_alignment import read_al
if __name__ == "__main__":
    # Aura queries use an encrypted connection using the "neo4j+s" URI scheme
    uri = "neo4j+s://1628a821.databases.neo4j.io"
    user = "neo4j"
    password = "CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI"
    app = App(uri, user, password)
    lista=read_al('../bloom-export/')
    app.return_alignment_nodes(lista)
from functions import App, construct_db
if __name__ == "__main__":
    # Aura queries use an encrypted connection using the "neo4j+s" URI scheme
    uri = "neo4j+s://1628a821.databases.neo4j.io"
    user = "neo4j"
    password = "CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI"
    app = App(uri, user, password)
    path_github='https://raw.githubusercontent.com/guglielmobruno/cov19gdb/main/data/neo'
    path='../public/result'
    construct_db(path,app)
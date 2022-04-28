from functions import parse_graph
if __name__ == "__main__":
    # Aura queries use an encrypted connection using the "neo4j+s" URI scheme
    path_drive_read='../data/'
    path_drive_write='../data/neo/'

    parse_graph(path_drive_read,path_drive_write)

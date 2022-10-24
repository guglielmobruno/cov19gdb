python3 python_scripts/parse_graph.py &
wait
bash bash_scripts/pushtogit.sh &
wait
node neoConstruct.mjs &
wait
node neoRetrieveData.mjs
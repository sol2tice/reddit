import os
import json
import codecs
from r2.models.camp import Camp, CampExists
import sys
from pysrc import pydevd

def populate(db_file_path = 'campdata.json'):
    reload(sys)
    pydevd.settrace('192.168.1.64', port=5678, stdoutToServer=True, stderrToServer=True)
    #Camp.delete_all()
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root_path, db_file_path)
    with open(path, 'r') as f:
	for line in f:
	  try:
 	    item = json.loads(line[0:len(line)-2])    
            c = Camp._new(item)
	  except CampExists:
	    continue

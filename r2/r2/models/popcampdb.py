import os
import json
import codecs
from r2.models.summercamp import SummerCamp, SummerCampExists
from r2.models.course import Course, Chapter, Lesson, TopicExists
import sys
from pysrc import pydevd

def populate(db_file_path = 'campdata.json'):
    reload(sys)
    pydevd.settrace('192.168.1.64', port=5678, stdoutToServer=True, stderrToServer=True)
#    SummerCamp.delete_all()
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root_path, db_file_path)
    with open(path, 'r') as f:
	for line in f:
	  try:
 	    item = json.loads(line[0:len(line)-2])    
            c = SummerCamp._new(item)
	  except SummerCampExists:
	    continue

def populateCourse(db_file_path = 'coursedata.json'):
    reload(sys)
    pydevd.settrace('192.168.1.64', port=5678, stdoutToServer=True, stderrToServer=True)
#    Lesson.delete_all()
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root_path, db_file_path)
    with open(path, 'r') as f:
        for line in f:
            try:
              item = json.loads(line[0:len(line)-2])    
              c = Lesson._new(item)
            except TopicExists:
              raise

from r2.models.account import Account, register
from r2.models.subreddit import Subreddit, SubredditExists
from r2.models.link import Link
from r2.lib.db.thing import NotFound
from pylons import g, c
from r2.lib.db import queries
import re

def populateCampSR():
    try:
        a = Account._by_name(g.system_user)
    except NotFound:
        a = register(g.system_user, "reddit", "127.0.0.1")

    name = "summer_camps"
    try:
        sr = Subreddit._new(name = name, title = "Summer Camps",
                            ip = '0.0.0.0', author_id = a._id, over_18 = True)
        sr.lang = "en"
        sr._commit()
    except SubredditExists:
        sr = Subreddit._by_name(name)
    
    list = SummerCamp.get_all_camp()
    for item in list:
        title = item.title
        cleaned_title = re.sub(r'\s+', ' ', title, flags=re.UNICODE)
        cleaned_title = cleaned_title.strip()
        l = Link._submit(cleaned_title, 'self', a, sr, '127.0.0.1')
        l.url = l.make_permalink_slow()
        l.is_self = True
	l.is_html_page = True
        l.selftext = item.name
        l.thumbnail_url = item.thumbnail_url
        l.thumbnail_size = item.thumbnail_size
        l._commit()
        l.set_url_cache()

        queries.queue_vote(a, l, True, '127.0.0.1', cheater=c.cheater)
        l._save(a)
	queries.new_link(l)

    queries.worker.join()

def populateCourseSR():
    try:
        a = Account._by_name(g.system_user)
    except NotFound:
        a = register(g.system_user, "reddit", "127.0.0.1", over_18 = True)

    name = "reddit_test8"
    try:
        sr = Subreddit._new(name = name, title = "reddit test8",
                            ip = '0.0.0.0', author_id = a._id)
        sr.lang = "en"
        sr._commit()
    except SubredditExists:
        sr = Subreddit._by_name(name)
        
    list = Lesson.get_all()
    for item in list:    
        title = item.title
        cleaned_title = re.sub(r'\s+', ' ', title, flags=re.UNICODE)
        cleaned_title = cleaned_title.strip()
        url = item.url
        l = Link._submit(cleaned_title, url, a, sr, '127.0.0.1')
        l.embed_url = item.embed_url
        l.hashcode = item.hashcode
        l._commit()
        l.set_url_cache()
        queries.queue_vote(a, l, True, '127.0.0.1', cheater=c.cheater)
        l._save(a)
        queries.new_link(l)
    queries.worker.join()

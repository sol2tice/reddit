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
from r2.lib.utils import domain
import urlparse
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
        l._commit()
        l.set_url_cache()
        queries.queue_vote(a, l, True, '127.0.0.1', cheater=c.cheater)
        l._save(a)
        queries.new_link(l)
	break
    queries.worker.join()

def tidyFieldValue(val):
    cleaned_val = re.sub(r'\s+', ' ', val)
    cleaned_val = cleaned_val.strip()
    return str(cleaned_val)

def createSubreddit(name, title, author):
    try:
        sr = Subreddit._new(name = name, title = title, type='course', show_media=True,
                            ip = '0.0.0.0', author_id = author._id)
        sr.lang = "en"
        sr._commit()
    except SubredditExists:
        sr = Subreddit._by_name(name)
    return sr

def getAdminAccount():
    try:
        a = Account._by_name(g.system_user)
    except NotFound:
        a = register(g.system_user, "reddit", "127.0.0.1", over_18 = True)
    return a

def createLink(title, url, thumbnail_url, ch_num, l_num, video_url, image_url, sr, account):
    l = Link._submit(title, url, account, sr, '127.0.0.1')
    #l.embed_url = embed_url
    l.ch_num = ch_num
    l.l_num = l_num
    l.thumbnail_url = thumbnail_url
    l.thumbnail_size = 70, 39
    media_object = make_media_object(video_url, image_url)
    l.set_media_object(media_object)
    l._commit()
    l.set_url_cache()
    queries.queue_vote(account, l, True, '127.0.0.1', cheater=c.cheater)
    l._save(account)
    queries.new_link(l)
    return l

def make_media_object(video_url, image_url):
    oembed=dict(html='<video width="587" height="330" poster="%s" controls="controls" preload="none"><source src="%s" type="video/mp4"></video><script src="../static/vendor/js/jquery.min.js" type="text/javascript"></script><script src="../static/vendor/js/mediaelement-and-player.min.js" type="text/javascript"></script><link  href="../static/css/vendor/mediaelementplayer.min.css" rel="Stylesheet" /><script>$("video,audio").mediaelementplayer(/* Options */)</script>' % (image_url, video_url), width="587", height="330")
    return {
        "type": domain(video_url),
        "oembed": oembed,
    }

def populateAllCourses(db_file_path = 'test.json'):
    reload(sys)
    pydevd.settrace('192.168.1.64', port=5678, stdoutToServer=True, stderrToServer=True)
    #Course.delete_all()
    root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root_path, db_file_path)
    account = getAdminAccount()
  
    with open(path, 'r') as f:
        data = f.read()
        cdata = json.loads(data)[0]
        links = []
        c = {}
        c['title'] = tidyFieldValue(cdata['title'])
        c['url'] = tidyFieldValue(cdata['url'])
        c['subject'] = tidyFieldValue(cdata['subject'])
        c['description'] = tidyFieldValue(cdata['description'])
	c['c_num'] = cdata['c_num']
        name = re.sub(r':\s+|\s+', '_', c['title'])
        sr = createSubreddit(name, c['title'], account)
        c['sr_id'] = sr._id
        try:
            course = Course._new(c)
            for i in cdata['chapters']:
		ch = {}
                ch['title'] = tidyFieldValue(i['title'])
		ch['c_num'] = c['c_num']
                ch['ch_num'] = i['ch_num']
		ch['course_id'] = course._id
                try:
                    chapter = Chapter._new(ch)
                    for j in i['lessons']:
			l = {}
                        l['title'] = tidyFieldValue(j['title'])
			l['c_num'] = c['c_num']
                        l['ch_num'] = ch['ch_num']
                        l['l_num'] = j['l_num']
                        l['chapter_id'] = chapter._id
                        l['course_id'] = course._id
			l['url'] = tidyFieldValue(j['url'])
                        #l['embed_url'] = tidyFieldValue(j['embed_url'])
			l['thumbnail_url'] = urlparse.urljoin(g.media_fs_base_url_http, j['thumbnail_url'])
                        l['image_url'] = j['image_url']
                        l['video_url'] = j['mdmp4_url']
                        try:
                            lesson = Lesson._new(l)
			    links.append(dict(title=l['title'], url=l['url'], thumbnail_url=l['thumbnail_url'], image_url=l['image_url'], video_url=l['video_url'], ch_num=l['ch_num'], l_num=l['l_num']))
                        except TopicExists:
                            g.log.error("populateAllCourses: lesson %s exists", l['title'])
                except TopicExists:
                    g.log.error("populateAllCourses: chapter %s exists", ch['title']);
        except TopicExists:
            g.log.error("populateAllCourses: course %s exists", c['title']);
	for index in range(len(links)):
            link = links.pop()
            createLink(link['title'], link['url'], link['thumbnail_url'], link['ch_num'], link['l_num'], l['video_url'], l['image_url'], sr, account)
	queries.worker.join()

from pylons import c, g
from pylons.i18n import _
import re
from r2.lib.db.thing import Thing, Relation, NotFound
from r2.lib.db.operators import lower
from r2.lib.cache import sgm
from r2.lib.memoize      import memoize
from datetime import datetime
from r2.lib.db.operators import desc
from r2.lib.db.tdb_sql import delete_things_by_id
from r2.lib.db.operators import asc, desc, timeago
from r2.lib.template_helpers import static

_fields = dict(title = (desc, 'title'),
                subject = (desc, 'subject'),
                course_id = (desc, 'course_id'))
filter_by = dict(all = None,
                title = Thing.c._date >= timeago('1 day'),
                category = Thing.c._date >= timeago('1 week'),
                subject = Thing.c._date >= timeago('1 month'),
                city = Thing.c._date >= timeago('1 year'))
def sort_by(sort):
    cls, col = _fields[sort]
    return cls(col)

class TopicExists(Exception): pass

class _Topic(Thing):
    _nodb = True
    _defaults = dict(
        title='',
        url='',
    )

    @classmethod
    def _new(cls, params, **kw):
        try:
	    name = re.sub(r'\s+', '', params['title'])
            cmp = cls._by_name(name)
            #raise TopicExists
	    return cmp
        except NotFound:
	    name = re.sub(r'\s+', '', params['title'])
            cmp = cls(name=name)

            for attr in cls._defaults:
                try:
                    cmp.__setattr__(attr, params[attr])
                except KeyError:
                    g.log.error("course: %s not found in %s", attr, params['title']);
            cmp._commit()

            #clear cache
            cls._by_name(name, _update = True)
            cls._by_name(name, allow_deleted = True, _update = True)
            return cmp

    @classmethod
    @memoize('_topic._by_name')
    def _by_name_cache(cls, name, allow_deleted = False):
        #relower name here, just in case
        deleted = (True, False) if allow_deleted else False
        q = cls._query(lower(cls.c.name) == name.lower(),
                       cls.c._spam == (True, False),
                       cls.c._deleted == deleted)

        q._limit = 1
        l = list(q)
        if l:
            return l[0]._id

    @classmethod
    def _by_name(cls, name, allow_deleted = False, _update = False):
        #lower name here so there is only one cache
        uid = cls._by_name_cache(name.lower(), allow_deleted, _update = _update)
        if uid:
            return cls._byID(uid, True)
        else:
            raise NotFound, 'Topic %s' % name        

    @classmethod
    def get_all(cls):
        q = cls._query(cls.c._spam == (True, False),
                       cls.c._deleted == False, sort = desc('_date'))
        return list(q)
    
    @classmethod
    def delete_all(cls):
        list = cls.get_all()
        for item in list:
            cls.delete(item)
            
    def delete(self, delete_message=None):
        self._cache.delete(str(self._id))
        delete_things_by_id(self._type_id, self._id )
        try:
        #update caches
            self._by_name(self.name, allow_deleted = True, _update = True)
        #we need to catch an exception here since it will have been
        #recently deleted
        except (NotFound, AttributeError) as e:
            pass
      
    def get_items(self, sort, time):
        q = self._query(sort = sort_by(sort), data = True)
        if time != 'all':
            q._filter(filter_by[time])     
        return list(q)
 
class Course(_Topic):
    _nodb = False
    _defaults = dict(
	title='',
        subject='',
        description='',
        url='',
        c_num='',
        sr_id='',
	lang='en'
    )
    _essentials = ('title', 'url', 'lang')    

class Chapter(_Topic):
    _nodb = False
    _defaults = dict(
	title='',
        c_num='',
        ch_num='',
        course_id=''
    )
    _essentials = ('title', 'id')    
    
class Lesson(_Topic):
    _nodb = False
    _defaults = dict(
	title='',
        url='',
        embed_url='',
        c_num='',
        ch_num='',
        l_num='',
        chapter_id='',
        course_id = '',
        hashcode = ''
    )
    _essentials = ('title', 'url')    


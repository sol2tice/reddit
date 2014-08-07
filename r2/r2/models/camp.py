from pylons import c, g
from pylons.i18n import _
from r2.lib.db.thing import Thing, Relation, NotFound
from r2.lib.db.operators import lower
from r2.lib.cache import sgm
from r2.lib.memoize      import memoize
from datetime import datetime
from r2.lib.db.operators import desc
from r2.lib.db.tdb_sql import delete_things_by_id
from r2.lib.template_helpers import static

class CampExists(Exception): pass

class Camp(Thing):
    _defaults = dict(
        title='',
        city='',
        grade='',
        category='',
        subject='',
        credit='',
        price='',
        duration='',
        starton='',
        deadline='',
        description='',
        schoolinfo='',
        timecost='',
        crimerate='',
        weather='',
        houseprice='',
        asianpop='',
        longitute='',
        latitute='',
        image ='',
        thumbnail_url = '',
        thumbnail_size = ''
    )
    _essentials = ('type', 'name', 'lang')
    @classmethod    
    def _new(cls, params, **kw):
        try:
            cmp = Camp._by_name(params['id'])
            raise CampExists
        except NotFound:
            cmp = Camp(name = params['id'],
                           lang = g.lang,
                           type = 'public')
	    thumbnail_size = 50, 50
            for attr in cls._defaults:
		try:
                    if attr == 'image':
                        path = params['images'][0]['path']
                        cmp.__setattr__(attr, path)
                        cmp.__setattr__('thumbnail_url', static('thumb/' + path[5:]))
                        cmp.__setattr__('thumbnail_size', thumbnail_size)
                    elif attr == 'thumbnail_url':
                        pass
                    elif attr == 'thumbnail_size':
                        pass
                    else:
                    	cmp.__setattr__(attr, params[attr])
		except IndexError:
		    g.log.error("popcampdb: %s index out of range in %s", attr, params['id']);
                except KeyError:
                    g.log.error("popcampdb: %s not found in %s", attr, params['id']);
            cmp._commit()

            #clear cache
            Camp._by_name(name= params['id'], _update = True)
            Camp._by_name(name= params['id'], allow_deleted = True, _update = True)
            return cmp
 
    @classmethod
    @memoize('camp._by_name')
    def _by_name_cache(cls, name, allow_deleted = False):
        #relower name here, just in case
        deleted = (True, False) if allow_deleted else False
        q = cls._query(lower(Camp.c.name) == name.lower(),
                       Camp.c._spam == (True, False),
                       Camp.c._deleted == deleted)

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
            raise NotFound, 'Camp %s' % name        

    @classmethod
    def get_all_camp(cls):
        q = cls._query(Camp.c._spam == (True, False),
                       Camp.c._deleted == False, sort = desc('_date'))
        return list(q)
    
    @classmethod
    def delete_all(cls):
        list = cls.get_all_camp()
        for item in list:
            cls.delete(item)
            
    def delete(self, delete_message=None):
        self._cache.delete(str(self._id))
        delete_things_by_id(self._type_id, self._id )
	try:
        #update caches
            Camp._by_name(self.name, allow_deleted = True, _update = True)
        #we need to catch an exception here since it will have been
        #recently deleted
        except (NotFound, AttributeError) as e:
            pass       


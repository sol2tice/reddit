import logging

from pylons.templating import render_mako as render

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from oauth2 import require_oauth2_scope
from reddit_base import base_listing
from r2.lib.pages.pages import Forum 

from r2.lib.base import BaseController
from r2.controllers.listingcontroller import HotController

log = logging.getLogger(__name__)

class HomeController(BaseController):

    def GET_index(self):
        # Return a rendered template
        #return render('/home.mako')
        # or, return a string
        return render('/home.html')

class ForumController(HotController):
    @require_oauth2_scope("read")
    @base_listing
    def GET_forum(self, **env):
	self.render_cls = Forum 
	return self.build_listing(**env)

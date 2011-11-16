#! /usr/bin/env python

import SimpleHTTPServer
import SocketServer
import urllib
import xmlrpclib
import cgi

PORT = 8000

class Proxy(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Is this a special request to /__ajaxproxy/
        prefix = '/__ajaxproxy/'
        if self.path.startswith(prefix):
            # Strip off the prefix.
            newPath = self.path.lstrip(prefix)
            print "GET remote: ", newPath
            try:
                self.copyfile(urllib.urlopen(newPath), self.wfile)
            except IOError, e:
                print "ERROR:   ", e
        else :
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
            
    def do_POST(self):
        # Parse the form data posted
        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'POST', 'CONTENT_TYPE':self.headers['Content-Type'], })
        self.send_response(200)
        
        print('Client: %s\n' % str(self.client_address))
        print('User-agent: %s\n' % str(self.headers['user-agent']))
        print('Path: %s\n' % self.path)
        print('Form data:\n')
        
        for field in form.keys():
            field_item = form[field]
            if field_item.filename:
                file_data = field_item.file.read()
                file_len = len(file_data)
                del file_data
                print('\tUploaded %s as "%s" (%d bytes)\n' % (field, field_item.filename, file_len))
            else:
                print('\t%s=%s\n' % (field, form[field].value))
        return
        
if __name__ == '__main__':
    SocketServer.ThreadingTCPServer.allow_reuse_address = True
    httpd = SocketServer.ThreadingTCPServer(('', PORT), Proxy)
    print "serving at port", PORT
    httpd.serve_forever()

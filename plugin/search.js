/**
 * Copyright (c) 2008 - 2009 by Eric Van Dewoestine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 *
 * Plugin which will use your default search engine (:h defsearch) to search
 * the domain you are currently browsing.  Also supports searching from your
 * web mail account.
 *
 * Usage:
 *   :search <search terms>
 *
 * Note:
 *   - defsearch values currently supported are 'google' and 'yahoo'.
 *   - mail clients currently supported include gmail and yahoo mail.
 *   - when on your default search engine's search results page, the search
 *     command will attempt to determine the domain to search by examining the
 *     current search query.
 *
 * Example mapping similar to 'o' or 't' to start the search command by typing
 * 's' in normal mode:
 *   map s :search<space>
 *
 * Another example which will attempt to grab the current query string, if you
 * are on the results page, and place it on the command line.
 *   map s <c-a-s>
 *
 * TODO
 *   - add support for using other search engines / web mail clients
 *
 * @version 0.2
 */

commands.add(["search"],
  "Search the current site using your default search engine.",
  function(args) {
    search.search(args.string);
  }
);
mappings.add([modes.NORMAL], ["<c-a-s>"],
  "Cycle through frames",
  function () {
    search.bootstrap();
  }
);

function Search() {
  const searchDomains = {
    google: {
      urlPattern: /^www\.google\.com$/,
      resultsPattern: /^http:\/\/www\.google\.com\/search|^http:\/\/(images|video|maps|news|groups|books|scholar|blogsearch)\.google\.com\/\1/,

      /**
       * Returns a list where the first element is the search url to use,
       * second element is the domain to search, or null if not found, and the
       * third element is the current query.
       */
      getSearchInfo: function(){
        var loc = window.content.document.location;
        var url = 'http://' + loc.host + loc.pathname + '?q=';
        var document = window.content.document;
        var form = document.forms[0];
        var value = null;
        for each (input in form.elements){
          if (input.name == 'q'){
            value = input.value;
            break;
          }
        }
        var match = value ? /site:\s*(\S+)\s*(.*)/.exec(value) : null;
        return match ? [url, match[1], match[2]] : [url, null, value];
      }
    },

    yahoo: {
      urlPattern: /^search\.yahoo\.com$/,
      resultsPattern: /^http:\/\/((images|video|news)\.)?search\.yahoo\.com\/search/,

      /**
       * Returns a list where the first element is the search url to use,
       * second element is the domain to search, or null if not found, and the
       * third element is the current query.
       */
      getSearchInfo: function(){
        var loc = window.content.document.location;
        var url = 'http://' + loc.host + loc.pathname + '?p=';
        var document = window.content.document;
        var form = document.forms[0];
        // edge case for image search on yahoo
        if (/images.search.yahoo.com/.test(loc)){
          var form = document.forms[1];
        }
        var value = null;
        for each (input in form.elements){
          if (input.name == 'p'){
            value = input.value;
            break;
          }
        }
        var match = value ? /site:\s*(\S+)\s*(.*)/.exec(value) : null;
        return match ? [url, match[1], match[2]] : [url, null, value];
      }
    }
  };

  const emailDomains = {
    find: function(domain){
      for (var name in emailDomains){
        if (emailDomains.hasOwnProperty(name) && emailDomains[name].urlPattern){
          if (emailDomains[name].urlPattern.test(domain)){
            return emailDomains[name];
          }
        }
      }
    },

    gmail: {
      urlPattern: /^mail\.google\.com$/,

      search: function(query){
        var loc = window.content.document.location.toString();
        var domain = loc.replace(/(https?:\/\/.*?)\/.*/, '$1');
        events.feedkeys(
          ':open ' + domain + '/mail/#search/' + escape(query) + '<cr>');
      }
    },

    yahoo: {
      urlPattern: /^.*\.mail\.yahoo\.com$/,

      search: function(query){
        var form =
          window.content.document.getElementById('searchTheMailFrmtop') ||
          window.content.document.getElementById('searchformtop');

        // "classic"
        if (form){
          for each (input in form.elements){
            if (input.name == 's'){
              input.value = query;
              break;
            }
          }
          form.submit();

        // "new"
        }else{
          var input = window.content.document.getElementById('_test_search_input');
          var event = window.content.document.createEvent('KeyboardEvent');
          event.initKeyEvent(
            "keydown", true, true, null, false, false, false, false, 13, 0);
          input.focus();
          input.value = query;
          input.dispatchEvent(event);
          input.blur();
        }
      }
    }
  };

  function getEngine(defsearch) {
    var engine = searchDomains[defsearch];
    if (!engine){
      var engines = [];
      for (var name in searchDomains){
        if (searchDomains.hasOwnProperty(name)){
          engines.push(name);
        }
      }
      liberator.echoerr(
        ":search currently only supports the following defsearch engines: " +
        engines.join(", "));
      return null;
    }
    return engine;
  }

  return {
    'search': function(query) {
      var loc = window.content.document.location.toString();
      var domain = loc.replace(/[a-z]+:\/\/(.*?)\/.*/, '$1');

      // alternate flow for searching mail
      var mail = emailDomains.find(domain);
      if (mail){
        mail.search(query);
        return;
      }

      var defsearch = options['defsearch'];
      var engine = getEngine(defsearch);

      if (!engine){
        return;
      }

      // if we are on the search results page for the search engine, attempt to
      // grab the domain from the search query.
      var url = null;
      if (engine.resultsPattern.test(loc)){
        var values = engine.getSearchInfo();
        url = values[0]
        domain = values[1];
      }

      var site = '';
      if (domain){
        site = engine.domainFilter ?
          engine.domainFilter(domain) : 'site:' + domain;
      }

      if (!url){
        events.feedkeys(':open ' + defsearch + ' ' + site + ' ' + query + '<cr>');
      }else{
        events.feedkeys(':open ' + url + escape(site + ' ' + query) + '<cr>');
      }
    },

    'bootstrap': function() {
      var loc = window.content.document.location.toString();
      var domain = loc.replace(/[a-z]+:\/\/(.*?)\/.*/, '$1');

      // currently not support for mail domains
      var mail = emailDomains.find(domain);
      var defsearch = options['defsearch'];
      var engine = getEngine(defsearch);

      var query = '';

      // not mail, engine found, on the search results page.
      if (!mail && engine && engine.resultsPattern.test(loc)){
        query = engine.getSearchInfo()[2];
      }

      events.feedkeys(':search ' + query)
    }
  };
}

var search = Search();

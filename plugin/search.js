/**
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
 *
 *   map s :search<space>
 *
 * TODO
 *   - add support for using other search engines / web mail clients
 *
 * @author Eric Van Dewoetine (ervandew@gmail.com)
 * @version 0.1
 */

commands.add(["search"],
  "Search the current site using your default search engine.",
  function(args) {
    var loc = window.content.document.location.toString();
    var domain = loc.replace(/[a-z]+:\/\/(.*?)\/.*/, '$1');

    // alternate flow for searching mail
    var mail = emailDomains.find(domain);
    if (mail){
      mail.search(args.string);
      return;
    }

    var defsearch = options['defsearch'];
    var engine = searchDomains[defsearch];
    if (!engine){
      var engines = [];
      for (var name in searchDomains){
        if (searchDomains.hasOwnProperty(name))
          engines.push(name);
      }
      liberator.echoerr(
        ":search currently only supports the following defsearch engines: " +
        engines.join(", "));
      return;
    }

    // if we are on the search results page for the search engine, attempt to
    // grab the domain from the search query.
    if (engine.urlPattern.test(domain)){
      domain = engine.searchInputDomain() || domain;
    }

    var site = engine.domainFilter ? engin.domainFilter(domain) : 'site:' + domain;
    events.feedkeys(
      ':open ' + defsearch + ' ' + site + ' ' + args.string + '<cr>');
  }
);

const searchDomains = {
  google: {
    urlPattern: new RegExp('^www\.google\.com$'),

    searchInputDomain: function(){
      var value = null;
      var form = window.content.document.getElementById('tsf');
      for each (input in form.elements){
        if (input.name == 'q'){
          value = input.value;
          break;
        }
      }
      var match = value ? /site:\s*(\S+).*/.exec(value) : null;
      return match ? match[1] : null;
    }
  },

  yahoo: {
    urlPattern: new RegExp('^search\.yahoo\.com$'),

    searchInputDomain: function(){
      var value = window.content.document.getElementById('yschsp').value;
      var match = value ? /site:\s*(\S+).*/.exec(value) : null;
      return match ? match[1] : null;
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
    urlPattern: new RegExp('^mail\.google\.com$'),

    search: function(query){
      var loc = window.content.document.location.toString();
      var domain = loc.replace(/(https?:\/\/.*?)\/.*/, '$1');
      events.feedkeys(
        ':open ' + domain + '/mail/#search/' + escape(query) + '<cr>');
    }
  },

  yahoo: {
    urlPattern: new RegExp('^.*\.mail\.yahoo\.com$'),

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

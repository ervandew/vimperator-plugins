/**
 * Plugin to search the current domain using your default search engine
 * (currently supports google and yahoo).
 *
 * Usage:
 *   :search <search terms>
 *
 * Note: when on your default search engine's search results page, the search
 * command will attempt to determine the domain to search by examining the
 * current search query.
 *
 * TODO
 *   - add support for using other search engines
 *
 * @author Eric Van Dewoetine
 * @version 0.1
 */

commands.add(["search"],
  "Search the current site using a search engine.",
  function(args) {
    var supported = ['google', 'yahoo'];
    var defsearch = options['defsearch'];
    var loc = window.content.document.location.toString();
    var domain = loc.replace(/[a-z]+:\/\/(.*?)\/.*/, '$1');

    // if we are on the search results page for the search engine, grab the
    // site from the search query if we can.
    if (new RegExp('^(www\.|search\.)?' + defsearch + '.com$').test(domain)){
      var value;
      if (defsearch == 'google'){
        var form = window.content.document.getElementById('tsf');
        for each (input in form.elements){
          if (input.name == 'q'){
            value = input.value;
            break;
          }
        }
      }else if (defsearch == 'yahoo'){
        value = window.content.document.getElementById('yschsp').value;
      }

      var match = value ? /site:\s*(\S+).*/.exec(value) : null;
      if (match){
        domain = match[1];
      }
    }

    if (supported.indexOf(defsearch) == -1){
      liberator.echoerr(
        ":search currently only supports defsearch engines 'google' and 'yahoo'"
      );
    }else{
      events.feedkeys(':open ' + defsearch + ' site:' + domain + ' ' + args.string + '<cr>');
    }
  }
);

mappings.add([modes.NORMAL], ["s"],
  "Initiate the :search command",
  function () { commandline.open(":", "search ", modes.EX); }
);

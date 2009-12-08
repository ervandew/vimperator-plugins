/**
 * Plugin which integrates arc90's readability bookmarklet into vimperator.
 *
 * Usage:
 *   :readability
 *     use readability to format the current page.
 *
 * Configuration:
 *   In the command declaration below you can edit the readStyle, readSize, and
 *   readMargin variables to specify your preferred readability supported
 *   values.
 *
 * Author: Eric Van Dewoestine
 */
commands.add(["readability"],
  "Reformat the current page for readability using arc90's Readability bookmarklet.",
  function(args) {
    // TODO: would be nice if this would work without feeding it to
    // document.location
    window.content.document.location = "javascript:" +
      "(function(){" +
      "    readStyle='style-ebook';" +
      "    readSize='size-large';" +
      "    readMargin='margin-narrow';" +
      "    _readability_script=document.createElement('SCRIPT');" +
      "    _readability_script.type='text/javascript';" +
      "    _readability_script.src=" +
      "      'http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());" +
      "    document.getElementsByTagName('head')[0].appendChild(_readability_script);" +
      "    _readability_css=document.createElement('LINK');" +
      "    _readability_css.rel='stylesheet';" +
      "    _readability_css.href=" +
      "      'http://lab.arc90.com/experiments/readability/css/readability.css';" +
      "    _readability_css.type='text/css';" +
      "    _readability_css.media='screen';" +
      "    document.getElementsByTagName('head')[0].appendChild(_readability_css);" +
      "    _readability_print_css=document.createElement('LINK');" +
      "    _readability_print_css.rel='stylesheet';" +
      "    _readability_print_css.href=" +
      "      'http://lab.arc90.com/experiments/readability/css/readability-print.css';" +
      "    _readability_print_css.media='print';" +
      "    _readability_print_css.type='text/css';" +
      "    document.getElementsByTagName('head')[0].appendChild(_readability_print_css);" +
      "    setTimeout(function(){" +
      "      var overlay = document.body;" +
      "      if (overlay) {" +
      "        overlay.className = '';" +
      "        overlay.firstChild.className = '';" +
      "        overlay.style.backgroundColor = '#999';" +
      "        overlay.style.color = '#333';" +
      "      }" +
      "    }, 1000);" +
      "})();";
  }, {argCount: 0}
);
